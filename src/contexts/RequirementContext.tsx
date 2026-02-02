import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Requirement, RequirementStatus, RequirementPriority } from '@/types/requirement';

interface RequirementContextType {
  requirements: Requirement[];
  addRequirement: (requirement: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => void;
  updateRequirement: (id: string, updates: Partial<Requirement>) => void;
  deleteRequirement: (id: string) => void;
  getRequirement: (id: string) => Requirement | undefined;
  addRequirementHistory: (id: string, action: string, comment?: string) => void;
  findDuplicateCases: (pnrTktLocalizador: string) => Requirement[];
}

const RequirementContext = createContext<RequirementContextType | undefined>(undefined);

// Mock data inicial de requerimientos (VO_ATO)
const mockRequirements: Requirement[] = [
  {
    id: '1',
    ticketNumber: 'VO_ATO-2025-001',
    nombreAsesor: 'Sandra Milena Jaramillo',
    horaIngresoCorreo: '09:30',
    correoElectronico: 'cliente@example.com',
    asuntoCorreoElectronico: 'Solicitud de cambio de vuelo',
    pais: 'CO',
    origenConsulta: 'AMADEUS',
    esSoporteIngles: false,
    pnrTktLocalizador: 'ABC123',
    tipoSolicitud: 'Solicitudes',
    motivo: 'Cambio de Status',
    subMotivo: 'O - Open for Use',
    solicitudCliente: 'Cliente solicita cambio de vuelo debido a error en la emisión del ticket. El sistema no permitió completar la reserva correctamente.',
    casoOpcion: 'SI_CERRAR_CASO',
    informacionBrindada: 'Se revisó el PNR en Amadeus. Se identificó error en la tarifa aplicada. Se procedió a solicitar waiver al GDS para realizar el cambio sin penalidad.',
    observaciones: 'Caso resuelto satisfactoriamente. Cliente confirmó recepción del nuevo ticket.',
    status: 'cerrado',
    priority: 'alta',
    assignedTo: 'Juan Pérez',
    assignedTeam: 'Soporte GDS',
    slaDeadline: new Date('2025-01-20'),
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
        action: 'Asignado a Juan Pérez - Soporte GDS',
        user: 'Admin',
        comment: 'Prioridad alta debido a error en emisión',
      },
    ],
    tags: ['amadeus', 'cambio-status', 'error-emision'],
  },
  {
    id: '2',
    ticketNumber: 'VO_ATO-2025-002',
    nombreAsesor: 'Sofia Guarin',
    horaIngresoCorreo: '14:15',
    correoElectronico: 'support@example.com',
    asuntoCorreoElectronico: 'Refund request - Flight cancellation',
    pais: 'US',
    origenConsulta: 'SABRE',
    esSoporteIngles: true,
    pnrTktLocalizador: 'XYZ789',
    tipoSolicitud: 'Reclamos',
    motivo: 'Alternativas',
    subMotivo: 'Cancelación - Operacional',
    solicitudCliente: 'Passenger requests refund due to flight cancellation. Original booking was made through GDS Sabre.',
    casoOpcion: 'NO_ESCALAR_CASO',
    escaladoA: 'SUPERVISOR',
    analisisAnalista: 'Caso complejo de cancelación operacional que requiere validación de políticas internacionales',
    informacionBrindada: '',
    observaciones: 'English support case. Escalado a supervisor para validación de políticas internacionales.',
    status: 'pendiente-supervisor',
    priority: 'media',
    assignedTeam: 'Soporte GDS',
    slaDeadline: new Date('2025-01-25'),
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
    ],
    tags: ['sabre', 'alternativas', 'english-support'],
  },
  {
    id: '3',
    ticketNumber: 'VO_ATO-2025-003',
    nombreAsesor: 'José Ramos',
    horaIngresoCorreo: '11:00',
    correoElectronico: 'agencia@travel.com',
    asuntoCorreoElectronico: 'Corrección en facturación',
    pais: 'BR',
    origenConsulta: 'AMADEUS',
    esSoporteIngles: false,
    pnrTktLocalizador: 'DEF456',
    tipoSolicitud: 'Solicitudes',
    motivo: 'Facturación',
    subMotivo: 'Aeropuerto',
    solicitudCliente: 'Agencia solicita corrección en facturación. Se cobró tarifa incorrecta en el ATO.',
    casoOpcion: 'NO_ESCALAR_CASO',
    escaladoA: 'OTRA_AREA',
    areaEscalamiento: 'Finanzas',
    informacionBrindada: '',
    observaciones: 'Caso escalado a finanzas. Resuelto en 48 horas.',
    status: 'pendiente-otra-area',
    priority: 'baja',
    assignedTo: 'Laura Sánchez',
    assignedTeam: 'Finanzas',
    slaDeadline: new Date('2025-01-17'),
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
        action: 'Escalado a Finanzas',
        user: 'José Ramos',
      },
      {
        id: '3',
        date: new Date('2025-01-14'),
        action: 'Requerimiento resuelto',
        user: 'Laura Sánchez',
        comment: 'Nota de crédito procesada. Cliente notificado.',
      },
    ],
    tags: ['facturacion', 'finanzas', 'nota-credito'],
  },
  {
    id: '4',
    ticketNumber: 'VO_ATO-2025-004',
    nombreAsesor: 'María González',
    horaIngresoCorreo: '16:45',
    correoElectronico: 'cliente@example.com',
    asuntoCorreoElectronico: 'Problema con check-in online',
    pais: 'AR',
    origenConsulta: 'SABRE',
    esSoporteIngles: false,
    pnrTktLocalizador: 'GHI789',
    tipoSolicitud: 'Reclamos',
    motivo: 'Check-In',
    subMotivo: 'Problema técnico',
    solicitudCliente: 'Cliente no puede realizar check-in online. El sistema muestra error al intentar acceder.',
    casoOpcion: 'NO_INTERACTUAR_AGENCIA',
    consultaAgencia: 'Verificar estado del vuelo y disponibilidad de asientos para check-in',
    respuestaAgencia: '',
    informacionBrindada: '',
    observaciones: 'Caso pendiente de respuesta de la agencia',
    status: 'pendiente-agencia',
    priority: 'alta',
    assignedTo: 'Ana López',
    assignedTeam: 'Soporte GDS',
    slaDeadline: new Date('2025-01-22'),
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
    tags: ['sabre', 'check-in', 'problema-tecnico'],
  },
  {
    id: '5',
    ticketNumber: 'VO_ATO-2025-005',
    nombreAsesor: 'Carlos Mendoza',
    horaIngresoCorreo: '08:20',
    correoElectronico: 'agencia@travel.com',
    asuntoCorreoElectronico: 'Solicitud de certificado médico',
    pais: 'CL',
    origenConsulta: 'AMADEUS',
    esSoporteIngles: false,
    pnrTktLocalizador: 'JKL012',
    tipoSolicitud: 'Solicitudes',
    motivo: 'Certificado Médico',
    subMotivo: 'Waiver médico',
    solicitudCliente: 'Cliente solicita waiver médico para cambio de vuelo debido a emergencia médica familiar.',
    casoOpcion: 'SI_CERRAR_CASO',
    informacionBrindada: 'Se procesó el waiver médico en Amadeus. Se aplicó código MEDWAIVER2025. Cliente debe presentar certificado médico en aeropuerto.',
    observaciones: 'Caso resuelto. Cliente informado sobre procedimiento.',
    status: 'cerrado',
    priority: 'critica',
    assignedTo: 'Pedro Silva',
    assignedTeam: 'Soporte GDS',
    slaDeadline: new Date('2025-01-21'),
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
        action: 'Caso cerrado con waiver médico',
        user: 'Pedro Silva',
      },
    ],
    tags: ['amadeus', 'certificado-medico', 'waiver'],
  },
  {
    id: '6',
    ticketNumber: 'VO_ATO-2025-006',
    nombreAsesor: 'Laura Torres',
    horaIngresoCorreo: '13:30',
    correoElectronico: 'support@example.com',
    asuntoCorreoElectronico: 'Escalamiento a área comercial',
    pais: 'PE',
    origenConsulta: 'SABRE',
    esSoporteIngles: false,
    pnrTktLocalizador: 'MNO345',
    tipoSolicitud: 'Reclamos',
    motivo: 'Distribución',
    subMotivo: 'Problema de tarifas',
    solicitudCliente: 'Cliente reporta inconsistencia en tarifas mostradas vs aplicadas en el sistema.',
    casoOpcion: 'NO_ESCALAR_CASO',
    escaladoA: 'OTRA_AREA',
    areaEscalamiento: 'Área Comercial',
    analisisAnalista: 'Problema complejo de tarifas que requiere revisión de políticas comerciales',
    informacionBrindada: '',
    observaciones: 'Escalado a Área Comercial para revisión de políticas de tarifas',
    status: 'pendiente-otra-area',
    priority: 'media',
    assignedTo: 'Laura Torres',
    assignedTeam: 'Soporte GDS',
    slaDeadline: new Date('2025-01-25'),
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
        action: 'Escalado a Área Comercial',
        user: 'Laura Torres',
      },
    ],
    tags: ['sabre', 'distribucion', 'tarifas', 'escalamiento'],
  },
];

export const RequirementProvider = ({ children }: { children: ReactNode }) => {
  const [requirements, setRequirements] = useState<Requirement[]>(mockRequirements);

  const addRequirement = (requirement: Omit<Requirement, 'id' | 'createdAt' | 'updatedAt' | 'history'>) => {
    const newRequirement: Requirement = {
      ...requirement,
      id: Date.now().toString(),
      createdAt: new Date(),
      updatedAt: new Date(),
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
    
    // Buscar casos con el mismo PNR/TKT/Localizador (case insensitive)
    const duplicates = requirements.filter(requirement => 
      requirement.pnrTktLocalizador && 
      requirement.pnrTktLocalizador.toLowerCase().trim() === pnrTktLocalizador.toLowerCase().trim()
    );
    
    // Ordenar por fecha de creación (más recientes primero)
    return duplicates.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
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
