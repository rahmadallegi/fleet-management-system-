import React from 'react';
import { LayoutDashboard } from 'lucide-react';
import SimplePlaceholder from '../components/SimplePlaceholder';

const SafeDashboard = () => {
  return (
    <SimplePlaceholder
      title="Dashboard"
      description="Fleet management overview and statistics"
      icon={LayoutDashboard}
    />
  );
};

export default SafeDashboard;
