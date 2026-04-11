import { apiCall } from '@/src/api/api';
import AuthService from '@/src/services/authService';

export type ReportPeriodSummary = {
  totalAppointments: number;
  statusCounts: {
    PENDING: number;
    CONFIRMED: number;
    COMPLETED: number;
    CANCELED: number;
  };
  topServices: {
    serviceId: string;
    name: string;
    count: number;
  }[];
};

export type ReportsSummaryResponse = {
  message: string;
  summary: {
    month: ReportPeriodSummary;
    year: ReportPeriodSummary;
    activeValidClients: number;
    referenceDate: string;
  };
};

class ReportsService {
  async getSummary(): Promise<ReportsSummaryResponse> {
    const token = await AuthService.getValidToken();

    if (!token) {
      throw new Error('Sessao expirada');
    }

    return apiCall<ReportsSummaryResponse>('/reports/summary', {
      method: 'GET',
      token,
    });
  }
}

export default new ReportsService();
