/**
 * Metadata schema system for model reflection.
 * Used by metadata-studio service for dynamic schema management.
 */

export type FieldType =
  | "string"
  | "number"
  | "boolean"
  | "date"
  | "reference"
  | "enum";

export type FieldMetadata = {
  name: string;
  type: FieldType;
  required: boolean;
  label?: string;
  description?: string;

  // For reference fields
  referenceTo?: string;

  // For enum fields
  enumValues?: string[];

  // Validation
  minLength?: number;
  maxLength?: number;
  pattern?: string;

  // UI hints
  placeholder?: string;
  helpText?: string;
};

export type EntityMetadata = {
  name: string;
  label: string;
  description?: string;
  fields: FieldMetadata[];

  // Access control
  permissions?: {
    create?: string[];
    read?: string[];
    update?: string[];
    delete?: string[];
  };
};

/**
 * Metadata registry for runtime schema introspection
 */
export class MetadataRegistry {
  private entities = new Map<string, EntityMetadata>();

  register(entity: EntityMetadata): void {
    this.entities.set(entity.name, entity);
  }

  get(entityName: string): EntityMetadata | undefined {
    return this.entities.get(entityName);
  }

  getAll(): EntityMetadata[] {
    return Array.from(this.entities.values());
  }

  getFieldMetadata(entityName: string, fieldName: string): FieldMetadata | undefined {
    const entity = this.get(entityName);
    return entity?.fields.find((f) => f.name === fieldName);
  }
}