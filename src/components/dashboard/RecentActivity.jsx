import React, { useEffect, useState } from 'react';
import { format } from 'date-fns';
import {
  UserPlusIcon,
  DocumentPlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { getRecentActivity } from '../../services/dashboard';


const ActivityItem = ({ activity }) => {
  const getIcon = (type) => {
    switch (type) {
      case 'user_added':
        return <UserPlusIcon className="h-5 w-5 text-green-500" />;
      case 'task_created':
        return <DocumentPlusIcon className="h-5 w-5 text-blue-500" />;
      case 'task_completed':
        return <CheckCircleIcon className="h-5 w-5 text-green-500" />;
      case 'task_delayed':
        return <ExclamationTriangleIcon className="h-5 w-5 text-red-500" />;
      case 'task_updated':
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  return (
    <div className="flex items-start space-x-3 py-3 border-b border-gray-100 last:border-0">
      <div className="flex-shrink-0 mt-1">
        <div className="h-8 w-8 rounded-full bg-gray-100 flex items-center justify-center">
          {getIcon(activity.type)}
        </div>
      </div>

      <div className="flex-1 min-w-0">
        <p className="text-sm text-gray-900">
          {activity.description}
        </p>
        <p className="text-xs text-gray-500 mt-1">
          {format(new Date(activity.timestamp), 'MMM dd, hh:mm a')}
        </p>
      </div>
    </div>
  );
};

const RecentActivity = () => {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchActivity = async () => {
      try {
        const res = await getRecentActivity();
        setActivities(res.data.data.recentActivity || []);
      } catch (error) {
        console.error('Failed to fetch recent activity', error);
      } finally {
        setLoading(false);
      }
    };

    fetchActivity();
  }, []);

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">
            Recent Activity
          </h3>
          <p className="text-sm text-gray-600">
            Latest updates from your team
          </p>
        </div>

        <Link to="/tasks">
          <button className="text-sm text-blue-600 hover:text-blue-700">
            View All
          </button>
        </Link>
      </div>

      {loading ? (
        <p className="text-sm text-gray-500">Loading activity...</p>
      ) : activities.length === 0 ? (
         <p className="text-sm text-gray-500">No recent activity</p>
      ) : (
        <div className="space-y-1">
          {activities.map((activity, idx) => (
            <ActivityItem key={idx} activity={activity} />
          ))}
        </div>
      )}
    </div>
  );
};

export default RecentActivity;
