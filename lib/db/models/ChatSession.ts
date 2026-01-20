import mongoose, { Schema, Document, Model } from 'mongoose';

export interface IMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  toolCalls?: Array<{
    toolName: string;
    arguments: Record<string, unknown>;
    result: Record<string, unknown>;
    timestamp: Date;
  }>;
  generatedComponents?: string[];
  linkedTransactionIds?: mongoose.Types.ObjectId[];
  metadata?: {
    actionType?: string;
  };
}

export interface IChatSession extends Document {
  userId: mongoose.Types.ObjectId;
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema<IMessage>({
  role: {
    type: String,
    enum: ['user', 'assistant'],
    required: true,
  },
  content: {
    type: String,
    required: [true, 'Message content is required'],
    maxlength: [10000, 'Message content cannot exceed 10,000 characters'],
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
  toolCalls: [
    {
      toolName: String,
      arguments: Schema.Types.Mixed,
      result: Schema.Types.Mixed,
      timestamp: Date,
    },
  ],
  generatedComponents: [String],
  linkedTransactionIds: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Transaction',
    },
  ],
  metadata: {
    actionType: String,
  },
});

const ChatSessionSchema = new Schema<IChatSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    messages: {
      type: [MessageSchema],
      validate: {
        validator: function(v: IMessage[]) {
          return v.length <= 1000;
        },
        message: 'Chat session cannot exceed 1000 messages'
      }
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient queries
ChatSessionSchema.index({ userId: 1, createdAt: -1 });
ChatSessionSchema.index({ userId: 1, updatedAt: -1 }); // For pagination

const ChatSession: Model<IChatSession> =
  mongoose.models.ChatSession ||
  mongoose.model<IChatSession>('ChatSession', ChatSessionSchema);

export default ChatSession;
