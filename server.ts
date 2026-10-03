import express from 'express';
import path from 'path';
import dotenv from 'dotenv';
import { GoogleGenAI, Type, FunctionDeclaration } from '@google/genai';
import { executeTool } from './src/utils/agentEngine';
import { runDeterministicAgent } from './src/utils/agentPlanner';
import { ShopState, ToolName } from './src/types';

dotenv.config();

const app = express();
app.use(express.json({ limit: '10mb' }));

const PORT = 3000;

// Gemini client initialization
let genAIClient: GoogleGenAI | null = null;
if (process.env.GEMINI_API_KEY) {
  genAIClient = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
}

const TOOL_DECLARATIONS: FunctionDeclaration[] = [
  {
    name: 'check_stock',
    description: 'Check available quantity, unit, and price of an item in the store inventory',
    parameters: {
      type: Type.OBJECT,
      properties: {
        item: {
          type: Type.STRING,
          description: 'Name of the item (e.g. sugar, sakhar, rice, tandul, oil, tel)',
        },
      },
      required: ['item'],
    },
  },
  {
    name: 'update_stock',
    description: 'Add or reduce inventory stock of an item (e.g. delta = -5 for order, +10 for new delivery)',
    parameters: {
      type: Type.OBJECT,
      properties: {
        item: { type: Type.STRING, description: 'Item name' },
        delta: { type: Type.NUMBER, description: 'Amount to add (positive) or deduct (negative)' },
        reason: { type: Type.STRING, description: 'Reason for inventory adjustment' },
      },
      required: ['item', 'delta'],
    },
  },
  {
    name: 'create_order',
    description: 'Create a new customer order and calculate total bill',
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer: { type: Type.STRING, description: 'Customer name (e.g. Ramesh, Suresh)' },
        items: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING, description: 'Item name' },
              qty: { type: Type.NUMBER, description: 'Quantity requested' },
              unit: { type: Type.STRING, description: 'Unit (kg, L, packet)' },
            },
            required: ['name', 'qty'],
          },
          description: 'List of items in the order',
        },
        paymentType: {
          type: Type.STRING,
          description: 'Payment type: credit (udhaar), cash, or upi',
        },
      },
      required: ['customer', 'items'],
    },
  },
  {
    name: 'add_to_customer_ledger',
    description: "Update the customer's khata udhaar (credit) balance",
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer: { type: Type.STRING, description: 'Customer name' },
        amount: { type: Type.NUMBER, description: 'Amount in ₹' },
        type: { type: Type.STRING, description: "'credit' for new debt or 'payment' for repayment" },
      },
      required: ['customer', 'amount', 'type'],
    },
  },
  {
    name: 'get_sales_summary',
    description: 'Get total sales revenue, order count, and profit for a time period',
    parameters: {
      type: Type.OBJECT,
      properties: {
        period: { type: Type.STRING, description: "'today', 'week', or 'month'" },
      },
      required: ['period'],
    },
  },
  {
    name: 'get_customer_balance',
    description: "Look up a customer's pending udhaar (credit) balance in the khata",
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer: { type: Type.STRING, description: 'Name of the customer' },
      },
      required: ['customer'],
    },
  },
  {
    name: 'add_item',
    description: 'Add a new product to the inventory',
    parameters: {
      type: Type.OBJECT,
      properties: {
        name: { type: Type.STRING, description: 'Product name' },
        unit: { type: Type.STRING, description: 'Unit (kg, L, etc.)' },
        price: { type: Type.NUMBER, description: 'Selling price per unit in ₹' },
        qty: { type: Type.NUMBER, description: 'Initial stock quantity' },
      },
      required: ['name', 'unit', 'price', 'qty'],
    },
  },
  {
    name: 'get_low_stock_items',
    description: 'List items that are running low on stock',
    parameters: {
      type: Type.OBJECT,
      properties: {
        threshold: { type: Type.NUMBER, description: 'Stock threshold level' },
      },
    },
  },
  {
    name: 'record_expense',
    description: 'Record an operational shop expense (tempo delivery, electricity, tea, etc.)',
    parameters: {
      type: Type.OBJECT,
      properties: {
        category: { type: Type.STRING, description: 'Category of expense' },
        amount: { type: Type.NUMBER, description: 'Amount spent in ₹' },
        note: { type: Type.STRING, description: 'Description or vendor name' },
      },
      required: ['category', 'amount'],
    },
  },
  {
    name: 'record_payment',
    description: "Record a payment received from customer to reduce their pending udhaar balance",
    parameters: {
      type: Type.OBJECT,
      properties: {
        customer: { type: Type.STRING, description: 'Customer name' },
        amount: { type: Type.NUMBER, description: 'Amount paid in ₹' },
      },
      required: ['customer', 'amount'],
    },
  },
];

const SYSTEM_INSTRUCTION = `You are Dukaan Saathi, a helpful assistant for an Indian shop owner. Understand commands in Marathi, Tamil, Hindi, English or a mix. Always plan multi-step tasks and call every needed tool in order (check stock before creating an order; if stock is insufficient, do NOT create the order and tell the owner what's available). Handle transliterated item names (e.g., 'sakhar' = sugar, 'tandul' = rice, 'tel' = oil, 'dal', 'chai patti', 'meeth' = salt, 'gahu' = wheat flour).
When an order is placed:
Step 1: check_stock(item)
Step 2: If stock is sufficient, create_order(customer, items)
Step 3: update_stock(item, delta=-qty, reason)
Step 4: add_to_customer_ledger(customer, amount=order_total, type='credit')
Reply briefly and warmly in the user's language, confirming each action done. If a request is ambiguous (e.g., unknown customer), ask ONE short clarifying question.`;

// API route for running agentic tasks
app.post('/api/agent/run', async (req, res) => {
  try {
    const { prompt, language = 'mr', currentState } = req.body;

    if (!prompt || !currentState) {
      return res.status(400).json({ error: 'Missing prompt or currentState' });
    }

    // Attempt with Gemini API function calling if API key is available
    if (genAIClient && process.env.GEMINI_API_KEY) {
      try {
        let activeState: ShopState = { ...currentState };
        const collectedSteps: any[] = [];
        const modelName = 'gemini-2.5-flash';

        // Prepare initial user message
        const contents: any[] = [
          {
            role: 'user',
            parts: [
              {
                text: `Owner command: "${prompt}"\nCurrent Language: ${language}\nAvailable inventory: ${JSON.stringify(
                  activeState.inventory.map((i) => ({ name: i.name, qty: i.qty, unit: i.unit, price: i.pricePerUnit }))
                )}\nCustomers: ${JSON.stringify(
                  activeState.customers.map((c) => ({ name: c.name, udhaar: c.udhaarBalance }))
                )}`,
              },
            ],
          },
        ];

        // Multi-turn Agent loop with Gemini (up to 5 tool iterations)
        let maxIterations = 5;
        let finalReply = '';

        while (maxIterations > 0) {
          maxIterations--;

          const response = await genAIClient.models.generateContent({
            model: modelName,
            contents,
            config: {
              systemInstruction: SYSTEM_INSTRUCTION,
              temperature: 0.2,
              tools: [{ functionDeclarations: TOOL_DECLARATIONS }],
            },
          });

          const functionCalls = response.functionCalls;

          if (!functionCalls || functionCalls.length === 0) {
            // Model finished and gave final text response
            finalReply = response.text || '';
            break;
          }

          // Execute each tool call requested by Gemini
          const toolResponseParts: any[] = [];

          for (const call of functionCalls) {
            const toolName = call.name as ToolName;
            const args = call.args || {};

            const result = executeTool(toolName, args, activeState, language);
            activeState = result.newState;
            collectedSteps.push(result.step);

            toolResponseParts.push({
              functionResponse: {
                name: toolName,
                response: result.step.result,
              },
            });
          }

          // Append model turn with tool calls
          const modelTurn = response.candidates?.[0]?.content;
          if (modelTurn) {
            contents.push(modelTurn);
          }

          // Append tool execution responses
          contents.push({
            role: 'user',
            parts: toolResponseParts,
          });
        }

        if (finalReply && collectedSteps.length > 0) {
          return res.json({
            success: true,
            newState: activeState,
            steps: collectedSteps,
            replyText: finalReply,
            spokenText: finalReply,
          });
        }
      } catch (geminiError) {
        console.warn('Gemini live call error, using deterministic agent planner:', geminiError);
      }
    }

    // High-performance deterministic agent runner
    const deterministicResult = runDeterministicAgent(prompt, currentState, language);
    return res.json({
      success: true,
      newState: deterministicResult.newState,
      steps: deterministicResult.steps,
      replyText: deterministicResult.replyText,
      spokenText: deterministicResult.spokenText,
    });
  } catch (err: any) {
    console.error('Agent execution error:', err);
    res.status(500).json({ error: err.message || 'Internal server error' });
  }
});

// Mount Vite or static server
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
    app.get('*', (_req, res) => {
      res.sendFile(path.resolve('dist/index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`VyavasAI server running on http://0.0.0.0:${PORT}`);
  });
}

startServer();
