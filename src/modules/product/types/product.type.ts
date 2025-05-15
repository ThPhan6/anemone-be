import { Product } from '../../device/entities/product.entity';

/**
 * Interface representing a device record from CSV import
 */
export interface ImportDeviceRecord {
  deviceId: string;
  sku: string;
  manufacturerId?: string;
  batchId?: string;
}

/**
 * Interface for a failed import record with validation errors
 */
export interface FailedImportRecord {
  deviceId: string;
  sku?: string;
  batchId?: string;
  manufacturerId?: string;
  errors: string[];
}

/**
 * Interface for import results
 */
export interface DeviceImportResult {
  successRecords: Product[];
  failedRecords: FailedImportRecord[];
}
