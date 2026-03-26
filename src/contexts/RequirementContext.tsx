import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Requirement, RequirementInteraction, RequirementInteractionStatus } from '@/types/requirement';
import type { UserRole } from '@/types/user';

interface RequirementContextType {
  requirements: Requirement[];
  addRequirement: (requirement: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'interactions'>) => void;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (id: string) => void;
  getRequirement: (id: string) => Requirement | undefined;
  addRequirementHistory: (id: string, action: string, comment?: string) => void;
  findDuplicateCases: (pnrTktLocalizador: string) => Requirement[];
  addInteraction: (requirementId: string, interaction: Omit<RequirementInteraction, 'id' | 'createdAt' | 'status'>) => void;
  respondInteraction: (requirementId: string, interactionId: string, response: { responseMessage: string; respondedByName: string; respondedByRole: UserRole }) => void;
  closeInteraction: (requirementId: string, interactionId: string, closedBy: { closedByName: string; closedByRole: UserRole }) => void;
}

const RequirementContext = createContext<RequirementContextType | undefined>(undefined);

// Mock data inicial de requerimientos (VO_ATO)
const mockRequirements: Requirement[] = [
  {
    id: '1',
    ticketNumber: 'VO_ATO-2025-001',
    nombreAsesor: 'Aeropuerto ATO',
    horaIngresoCorreo: '09:30',
    correoElectronico: 'ato@jetsmart.com',
    pais: 'CO',
    baseOrigen: 'BOG',
    pnrTktLocalizador: 'A1BC2D',
    pasajeroNombreApellido: 'Juan Pérez',
    pasajeroDocumento: 'DNI 12345678',
    pasajeroCorreo: 'juan.perez@example.com',
    fechaVuelo: new Date('2025-01-14'),
    numeroVuelo: '1234',
    tramoVuelo: 'BOG-LIM',
    vueloOperadoPor: 'JA',
    motivo: 'OVBK Operacional',
    subMotivo: 'Voluntario',
    montoVoucherUsd: 400, // internacional (Colombia → Perú)
    fechaEnvioVoucher: new Date('2025-01-16'),
    observaciones: 'Caso cerrado por envío de voucher. Cliente confirmó recepción.',
    status: 'enviado',
    priority: 'alta',
    assignedTeam: 'Soporte CC',
    initialDate: new Date('2025-01-15'),
    resolvedAt: new Date('2025-01-16'),
    createdAt: new Date('2025-01-15'),
    updatedAt: new Date('2025-01-16'),
    statusChangedAt: new Date('2025-01-16'),
    history: [
      {
        id: '1',
        date: new Date('2025-01-15'),
        action: 'Requerimiento creado',
        user: 'Sistema',
      },
      {
        id: '2',
        date: new Date('2025-01-16'),
        action: 'Caso Cerrado por envío de Voucher por Parte de Soporte CC',
        user: 'Soporte CC',
        comment: 'Fecha de envío: 2025-01-16',
      },
    ],
    interactions: [],
    tags: ['ato', 'amadeus', 'error-emision'],
  },
  {
    id: '2',
    ticketNumber: 'VO_ATO-2025-002',
    nombreAsesor: 'Aeropuerto ATO',
    horaIngresoCorreo: '14:15',
    correoElectronico: 'ato@jetsmart.com',
    pais: 'CO',
    baseOrigen: 'MDE',
    pnrTktLocalizador: 'B2CD3E',
    pasajeroNombreApellido: 'María González',
    pasajeroDocumento: 'PASAPORTE X1234567',
    pasajeroCorreo: 'maria.gonzalez@example.com',
    fechaVuelo: new Date('2025-01-18'),
    numeroVuelo: '5678',
    tramoVuelo: 'MDE-BOG',
    vueloOperadoPor: 'WJ',
    motivo: 'OVBK Comercial',
    subMotivo: 'Involuntario',
    montoVoucherUsd: 200, // nacional (Colombia)
    observaciones: 'Caso en gestión por Soporte CC.',
    status: 'en-gestion',
    priority: 'media',
    assignedTeam: 'Soporte CC',
    assignedTo: 'Soporte CC',
    initialDate: new Date('2025-01-18'),
    createdAt: new Date('2025-01-18'),
    updatedAt: new Date('2025-01-18'),
    history: [
      {
        id: '1',
        date: new Date('2025-01-18'),
        action: 'Requerimiento creado',
        user: 'Sistema',
      },
      {
        id: '2',
        date: new Date('2025-01-18'),
        action: 'Caso en gestión',
        user: 'Soporte CC',
        comment: 'Estado actualizado a En Gestión',
      },
    ],
    interactions: [],
    tags: ['ato', 'sabre', 'voucher'],
  },
  {
    id: '3',
    ticketNumber: 'VO_ATO-2025-003',
    nombreAsesor: 'Aeropuerto ATO',
    horaIngresoCorreo: '11:00',
    correoElectronico: 'ato@jetsmart.com',
    pais: 'BR',
    baseOrigen: 'GRU',
    pnrTktLocalizador: 'C3DE4F',
    pasajeroNombreApellido: 'Ana López',
    pasajeroDocumento: 'RUT 12.345.678-9',
    pasajeroCorreo: 'ana.lopez@example.com',
    fechaVuelo: new Date('2025-01-10'),
    numeroVuelo: '9012',
    tramoVuelo: 'GRU-GIG',
    vueloOperadoPor: 'JZ',
    motivo: 'OVBK Operacional',
    subMotivo: 'Involuntario',
    montoVoucherUsd: 200, // nacional (Brasil)
    observaciones: 'En gestión por Soporte CC.',
    status: 'en-gestion',
    priority: 'baja',
    assignedTo: 'Soporte CC',
    assignedTeam: 'Soporte CC',
    initialDate: new Date('2025-01-10'),
    createdAt: new Date('2025-01-10'),
    updatedAt: new Date('2025-01-14'),
    resolvedAt: new Date('2025-01-14'),
    history: [
      {
        id: '1',
        date: new Date('2025-01-10'),
        action: 'Requerimiento creado',
        user: 'Sistema',
      },
      {
        id: '2',
        date: new Date('2025-01-11'),
        action: 'Caso en gestión',
        user: 'Soporte CC',
        comment: 'Estado actualizado a En Gestión',
      },
      {
        id: '3',
        date: new Date('2025-01-14'),
        action: 'Trabajo en curso',
        user: 'Soporte CC',
        comment: 'Gestión de voucher en proceso',
      },
    ],
    interactions: [],
    tags: ['facturacion', 'finanzas', 'nota-credito'],
  },
  {
    id: '4',
    ticketNumber: 'VO_ATO-2025-004',
    nombreAsesor: 'Aeropuerto ATO',
    horaIngresoCorreo: '16:45',
    correoElectronico: 'ato@jetsmart.com',
    pais: 'AR',
    baseOrigen: 'EZE',
    pnrTktLocalizador: 'D4EF5G',
    pasajeroNombreApellido: 'Carlos Mendoza',
    pasajeroDocumento: 'DNI 87654321',
    pasajeroCorreo: 'carlos.mendoza@example.com',
    fechaVuelo: new Date('2025-01-19'),
    numeroVuelo: '3456',
    tramoVuelo: 'EZE-LIM',
    vueloOperadoPor: 'J6',
    motivo: 'OVBK Comercial',
    subMotivo: 'Voluntario',
    montoVoucherUsd: 400, // internacional (Argentina → Perú)
    observaciones: 'Caso ingresado por ATO.',
    status: 'ingresado',
    priority: 'alta',
    assignedTeam: undefined,
    initialDate: new Date('2025-01-19'),
    createdAt: new Date('2025-01-19'),
    updatedAt: new Date('2025-01-19'),
    history: [
      {
        id: '1',
        date: new Date('2025-01-19'),
        action: 'Requerimiento creado',
        user: 'Sistema',
      },
    ],
    interactions: [],
    tags: ['ato', 'sabre', 'check-in'],
  },
  {
    id: '5',
    ticketNumber: 'VO_ATO-2025-005',
    nombreAsesor: 'Aeropuerto ATO',
    horaIngresoCorreo: '08:20',
    correoElectronico: 'ato@jetsmart.com',
    pais: 'CL',
    baseOrigen: 'SCL',
    pnrTktLocalizador: 'E5FG6H',
    pasajeroNombreApellido: 'Laura Torres',
    pasajeroDocumento: 'PASAPORTE Y7654321',
    pasajeroCorreo: 'laura.torres@example.com',
    fechaVuelo: new Date('2025-01-20'),
    numeroVuelo: '7890',
    tramoVuelo: 'SCL-ZCO',
    vueloOperadoPor: 'JA',
    motivo: 'OVBK Operacional',
    subMotivo: 'Voluntario',
    montoVoucherUsd: 200, // nacional (Chile)
    fechaEnvioVoucher: new Date('2025-01-20'),
    observaciones: 'Caso cerrado por envío de voucher. Cliente informado sobre procedimiento.',
    status: 'enviado',
    priority: 'critica',
    assignedTo: 'Soporte CC',
    assignedTeam: 'Soporte CC',
    initialDate: new Date('2025-01-20'),
    resolvedAt: new Date('2025-01-20'),
    createdAt: new Date('2025-01-20'),
    updatedAt: new Date('2025-01-20'),
    history: [
      {
        id: '1',
        date: new Date('2025-01-20'),
        action: 'Requerimiento creado',
        user: 'Sistema',
      },
      {
        id: '2',
        date: new Date('2025-01-20'),
        action: 'Caso Cerrado por envío de Voucher por Parte de Soporte CC',
        user: 'Soporte CC',
        comment: 'Fecha de envío: 2025-01-20',
      },
    ],
    interactions: [],
    tags: ['amadeus', 'certificado-medico', 'waiver'],
  },
  {
    id: '6',
    ticketNumber: 'VO_ATO-2025-006',
    nombreAsesor: 'Aeropuerto ATO',
    horaIngresoCorreo: '13:30',
    correoElectronico: 'ato@jetsmart.com',
    pais: 'PE',
    baseOrigen: 'LIM',
    pnrTktLocalizador: 'F6GH7J',
    pasajeroNombreApellido: 'Pedro Silva',
    pasajeroDocumento: 'DNI 11223344',
    pasajeroCorreo: 'pedro.silva@example.com',
    fechaVuelo: new Date('2025-01-21'),
    numeroVuelo: '2468',
    tramoVuelo: 'LIM-SCL',
    vueloOperadoPor: 'WJ',
    motivo: 'OVBK Comercial',
    subMotivo: 'Involuntario',
    montoVoucherUsd: 400, // internacional (Perú → Chile)
    observaciones: 'En gestión por Soporte CC.',
    status: 'en-gestion',
    priority: 'media',
    assignedTo: 'Soporte CC',
    assignedTeam: 'Soporte CC',
    initialDate: new Date('2025-01-21'),
    createdAt: new Date('2025-01-21'),
    updatedAt: new Date('2025-01-21'),
    history: [
      {
        id: '1',
        date: new Date('2025-01-21'),
        action: 'Requerimiento creado',
        user: 'Sistema',
      },
      {
        id: '2',
        date: new Date('2025-01-21'),
        action: 'Caso en gestión',
        user: 'Soporte CC',
        comment: 'Estado actualizado a En Gestión',
      },
    ],
    interactions: [],
    tags: ['soporte-cc', 'tarifas'],
  },
];

export const RequirementProvider = ({ children }: { children: ReactNode }) => {
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);

  const addRequirement = (requirement: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'history' | 'interactions'>) => {
    const newRequirement: Requirement = {
      ...requirement,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
      interactions: [],
      history: [
        {
          id: '1',
          date: new Date(),
          action: 'Requerimiento creado',
          user: requirement.nombreAsesor,
        },
      ],
    };
    setRequirements([newRequirement, ...requirements]);
  };

  const updateRequirement = (id: string, updates: Partial<Requirement>) => {
    setRequirements(requirements.map(requirement => {
      if (requirement.id === id) {
        const updatedRequirement = { ...requirement, ...updates, updatedAt: new Date() };
        
        // Si el estado cambió, actualizar statusChangedAt
        if (updates.status && updates.status !== requirement.status) {
          updatedRequirement.statusChangedAt = new Date();
        }
        
        return updatedRequirement;
      }
      return requirement;
    }));
  };

  const deleteRequirement = (id: string) => {
    setRequirements(requirements.filter(requirement => requirement.id !== id));
  };

  const getRequirement = (id: string) => {
    return requirements.find(requirement => requirement.id === id);
  };

  const addRequirementHistory = (id: string, action: string, comment?: string) => {
    setRequirements(requirements.map(requirement => {
      if (requirement.id === id) {
        const newHistory = {
          id: Date.now().toString(),
          date: new Date(),
          action,
          user: 'Usuario',
          comment,
        };
        return {
          ...requirement,
          history: [...requirement.history, newHistory],
          updatedAt: new Date(),
        };
      }
      return requirement;
    }));
  };

  const findDuplicateCases = (pnrTktLocalizador: string): Requirement[] => {
    if (!pnrTktLocalizador || pnrTktLocalizador.trim() === '') {
      return [];
    }
    
    // Buscar casos con el mismo Código de Reserva (PNR) (case insensitive)
    const duplicates = requirements.filter(requirement => 
      requirement.pnrTktLocalizador && 
      requirement.pnrTktLocalizador.toLowerCase().trim() === pnrTktLocalizador.toLowerCase().trim()
    );
    
    // Ordenar por fecha de creación (más recientes primero)
    return duplicates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  };

  const addInteraction: RequirementContextType['addInteraction'] = (requirementId, interaction) => {
    setRequirements((prev) =>
      prev.map((req) => {
        if (req.id !== requirementId) return req;

        const newInteraction: RequirementInteraction = {
          ...interaction,
          id: Date.now().toString(),
          createdAt: new Date(),
          status: 'PENDIENTE',
        };

        return {
          ...req,
          interactions: [newInteraction, ...(req.interactions || [])],
          history: [
            ...req.history,
            {
              id: `${Date.now()}-history`,
              date: new Date(),
              action: `Interacción creada (${newInteraction.type})`,
              user: newInteraction.createdByName,
              comment: newInteraction.title ? `${newInteraction.title}: ${newInteraction.message}` : newInteraction.message,
            },
          ],
          updatedAt: new Date(),
        };
      })
    );
  };

  const respondInteraction: RequirementContextType['respondInteraction'] = (requirementId, interactionId, response) => {
    setRequirements((prev) =>
      prev.map((req) => {
        if (req.id !== requirementId) return req;

        const interactions = (req.interactions || []).map((it) => {
          if (it.id !== interactionId) return it;
          if (it.status !== 'PENDIENTE') return it;

          return {
            ...it,
            status: 'RESPONDIDA' as RequirementInteractionStatus,
            respondedAt: new Date(),
            respondedByName: response.respondedByName,
            respondedByRole: response.respondedByRole,
            responseMessage: response.responseMessage,
          };
        });

        const interacted = req.interactions?.find((it) => it.id === interactionId);

        return {
          ...req,
          interactions,
          history: [
            ...req.history,
            {
              id: `${Date.now()}-history`,
              date: new Date(),
              action: `Interacción respondida (${interacted?.type || 'N/A'})`,
              user: response.respondedByName,
              comment: response.responseMessage,
            },
          ],
          updatedAt: new Date(),
        };
      })
    );
  };

  const closeInteraction: RequirementContextType['closeInteraction'] = (requirementId, interactionId, closedBy) => {
    setRequirements((prev) =>
      prev.map((req) => {
        if (req.id !== requirementId) return req;

        const interactions = (req.interactions || []).map((it) => {
          if (it.id !== interactionId) return it;
          if (it.status === 'CERRADA') return it;

          return {
            ...it,
            status: 'CERRADA' as RequirementInteractionStatus,
            closedAt: new Date(),
            closedByName: closedBy.closedByName,
            closedByRole: closedBy.closedByRole,
          };
        });

        const interacted = req.interactions?.find((it) => it.id === interactionId);

        return {
          ...req,
          interactions,
          history: [
            ...req.history,
            {
              id: `${Date.now()}-history`,
              date: new Date(),
              action: `Interacción cerrada (${interacted?.type || 'N/A'})`,
              user: closedBy.closedByName,
            },
          ],
          updatedAt: new Date(),
        };
      })
    );
  };

  return (
    <RequirementContext.Provider value={{
      requirements,
      addRequirement,
      updateRequirement,
      deleteRequirement,
      getRequirement,
      addRequirementHistory,
      findDuplicateCases,
      addInteraction,
      respondInteraction,
      closeInteraction,
    }}>
      {children}
    </RequirementContext.Provider>
  );
};

export const useRequirements = () => {
  const context = useContext(RequirementContext);
  if (context === undefined) {
    throw new Error('useRequirements must be used within a RequirementProvider');
  }
  return context;
};
