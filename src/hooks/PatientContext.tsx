import { createContext, useContext, useState, ReactNode } from 'react';

interface PatientData {
    name: string;
    gender: string;
    age: number;
    disease: string;
}

interface PatientContextType {
    patient: PatientData | null;
    setPatient: (patient: PatientData) => void;
}

const PatientContext = createContext<PatientContextType | undefined>(undefined);

export function PatientProvider({ children }: { children: ReactNode }) {
    const [patient, setPatient] = useState<PatientData | null>(null);

    return (
        <PatientContext.Provider value={{ patient, setPatient }}>
            {children}
        </PatientContext.Provider>
    );
}

export function usePatient() {
    const context = useContext(PatientContext);
    if (!context) {
        // Return default values if context not available
        return {
            patient: { name: 'Patient', gender: 'Not specified', age: 0, disease: 'None' },
            setPatient: () => { }
        };
    }
    return context;
}