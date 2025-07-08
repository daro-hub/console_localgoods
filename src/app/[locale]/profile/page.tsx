import { use } from 'react';
import { DashboardLayout } from '@/components/DashboardLayout';
import { ProfilePage } from '@/components/ProfilePage';

interface ProfilePageProps {
  params: Promise<{
    locale: string;
  }>;
}

export default function Profile({ params }: ProfilePageProps) {
  const { locale } = use(params);
  
  return (
    <DashboardLayout locale={locale}>
      <ProfilePage locale={locale} />
    </DashboardLayout>
  );
} 