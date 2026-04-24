import DashboardProdutor from './DashboardProdutor';
import DashboardAfiliado from './DashboardAfiliado';

export default function DashboardView({ userType }: { userType: string }) {
  if (userType === 'afiliado') {
    return <DashboardAfiliado />;
  }
  return <DashboardProdutor />;
}

