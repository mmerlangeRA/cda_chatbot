export interface WorkstationFields {
  cabine: string;
  ligne: string;
  poste: string;
}

const WORKSTATION_STORAGE_KEY = 'workstation_fields';

const defaultWorkstationFields: WorkstationFields = {
  cabine: '',
  ligne: '',
  poste: ''
};

export const workstationService = {
  // Get workstation fields from localStorage
  getWorkstationFields(): WorkstationFields {
    try {
      const stored = localStorage.getItem(WORKSTATION_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        // Ensure all required fields exist
        return {
          cabine: parsed.cabine || '',
          ligne: parsed.ligne || '',
          poste: parsed.poste || ''
        };
      }
    } catch (error) {
      console.error('Error reading workstation fields from localStorage:', error);
    }
    return { ...defaultWorkstationFields };
  },

  // Save workstation fields to localStorage
  setWorkstationFields(fields: WorkstationFields): void {
    try {
      localStorage.setItem(WORKSTATION_STORAGE_KEY, JSON.stringify(fields));
    } catch (error) {
      console.error('Error saving workstation fields to localStorage:', error);
    }
  },

  // Update a single field
  updateField(field: keyof WorkstationFields, value: string): WorkstationFields {
    const current = this.getWorkstationFields();
    const updated = { ...current, [field]: value };
    this.setWorkstationFields(updated);
    return updated;
  },

  // Clear all fields
  clearWorkstationFields(): void {
    try {
      localStorage.removeItem(WORKSTATION_STORAGE_KEY);
    } catch (error) {
      console.error('Error clearing workstation fields from localStorage:', error);
    }
  }
};
