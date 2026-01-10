import { useEffect, useState } from 'react';
import {
  CalendarDaysIcon,
  CheckCircleIcon,
  ClockIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  BuildingOfficeIcon
} from '@heroicons/react/24/outline';
import { getDashboardCards } from '../../services/dashboard';

const StatCard = ({ title, value, icon: Icon, color }) => {
  const colors = {
    blue: 'bg-blue-500',
    green: 'bg-green-500',
    yellow: 'bg-yellow-500',
    orange: 'bg-orange-500',
    purple: 'bg-purple-500',
    indigo: 'bg-indigo-500'
  };

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center">
        <div>
          <p className="text-sm text-gray-600">{title}</p>
          <p className="text-2xl font-bold">{value}</p>
        </div>
        <div className={`p-3 rounded-full ${colors[color]}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const StatsCards = () => {
  const [cards, setCards] = useState(null);

  useEffect(() => {
    const loadCards = async () => {
      const res = await getDashboardCards();
      setCards(res.data.data);
      // console.log("cards ", cards);
      
    };
    loadCards();
  }, []);

  if (!cards) return null;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <StatCard
        title="Total Tasks"
        value={cards.totalTasks}
        icon={CalendarDaysIcon}
        color="blue"
      />
      <StatCard
        title="Completed Tasks"
        value={cards.completedTasks}
        icon={CheckCircleIcon}
        color="green"
      />
      <StatCard
        title="In Progress"
        value={cards.inProgressTasks}
        icon={ArrowTrendingUpIcon}
        color="orange"
      />
      <StatCard
        title="Pending Tasks"
        value={cards.pendingTasks}
        icon={ClockIcon}
        color="yellow"
      />
      <StatCard
        title="Team Members"
        value={cards.teamMembers}
        icon={UserGroupIcon}
        color="purple"
      />
      <StatCard
        title="Active Companies"
        value={cards.activeCompanies}
        icon={BuildingOfficeIcon}
        color="indigo"
      />
    </div>
  );
};

export default StatsCards;
