import { Schema, model, models } from 'mongoose';

const ConfigurationSchema = new Schema({
	key: { type: String, required: true, unique: true, trim: true },
	value: { type: String, required: true },
	created_at: { type: Date, default: Date.now, required: true },
	created_by: { type: Schema.Types.ObjectId, ref: 'users', required: true },
	updated_at: { type: Date, default: null, required: false },
	updated_by: { type: Schema.Types.ObjectId, ref: 'users', required: false },
	deleted_at: { type: Date, required: false },
	deleted_by: { type: Schema.Types.ObjectId, ref: 'users', required: false },
});

ConfigurationSchema.index({ created_at: -1 });
ConfigurationSchema.index({ deleted_at: 1 });

export const Configurations =
	models.configurations || model('configurations', ConfigurationSchema);
