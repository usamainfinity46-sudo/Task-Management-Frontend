/* eslint-disable react-hooks/purity */
import React from 'react';
import { format } from 'date-fns';
import { 
  UserPlusIcon,
  DocumentPlusIcon,
  CheckCircleIcon,
  ExclamationTriangleIcon,
  ClockIcon
} from '@heroicons/react/24/outline';
import { Link } from "react-router-dom";


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
      default:
        return <ClockIcon className="h-5 w-5 text-gray-500" />;
    }
  };

  const getDescription = (activity) => {
    switch (activity.type) {
      case 'user_added':
        return `${activity.user} added ${activity.target} to the team`;
      case 'task_created':
        return `${activity.user} created task "${activity.task}"`;
      case 'task_completed':
        return `${activity.user} completed "${activity.task}"`;
      case 'task_delayed':
        return `${activity.task} is delayed`;
      default:
        return activity.description;
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
        <p className="text-sm text-gray-900">{getDescription(activity)}</p>
        <p className="text-xs text-gray-500 mt-1">
          {format(new Date(activity.timestamp), 'MMM dd, hh:mm a')}
        </p>
      </div>
    </div>
  );
};

const RecentActivity = ({ activities }) => {
  const sampleActivities = activities.length > 0 ? activities : [
    {
      id: 1,
      type: 'task_completed',
      user: 'John Doe',
      task: 'Project Setup',
      timestamp: new Date().toISOString()
    },
    {
      id: 2,
      type: 'user_added',
      user: 'Admin',
      target: 'Jane Smith',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    },
    {
      id: 3,
      type: 'task_created',
      user: 'Manager',
      task: 'Dashboard Implementation',
      timestamp: new Date(Date.now() - 7200000).toISOString()
    },
    {
      id: 4,
      type: 'task_delayed',
      task: 'API Integration',
      timestamp: new Date(Date.now() - 10800000).toISOString()
    }
  ];

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
          <p className="text-sm text-gray-600">Latest updates from your team</p>
        </div>
        <Link to='/tasks'>
        <button className="text-sm text-blue-600 hover:text-blue-700">
          View All
        </button>
        </Link>
      </div>
      
      <div className="space-y-1">
        {sampleActivities.map((activity) => (
          <ActivityItem key={activity.id} activity={activity} />
        ))}
      </div>
    </div>
  );
};

export default RecentActivity;