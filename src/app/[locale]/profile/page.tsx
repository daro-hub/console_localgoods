import { DashboardLayout } from '@/components/DashboardLayout';
import { ProfilePage } from '@/components/ProfilePage';

interface ProfilePageProps {
  params: {
    locale: string;
  };
}

export default function Profile({ params }: ProfilePageProps) {
  return (
    <DashboardLayout locale={params.locale}>
      <ProfilePage locale={params.locale} />
    </DashboardLayout>
  );
} 