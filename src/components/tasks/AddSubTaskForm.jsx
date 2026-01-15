import { useState } from 'react';
import { taskService } from '../../services/tasks';
import toast from 'react-hot-toast';

const statusOptions = ['pending', 'in-progress', 'completed', 'delayed'];

const AddSubTaskForm = ({ task, onClose, onAdded }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]); // today
  const [description, setDescription] = useState('');
  const [status, setStatus] = useState('pending');
  const [hoursSpent, setHoursSpent] = useState(0);
  const [remarks, setRemarks] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const subTaskData = { date, description, status, hoursSpent, remarks };
      const response = await taskService.addSubTask(task._id, subTaskData);
      toast.success('Subtask added successfully!');
      onAdded(response.data.subTask); // callback to parent to update UI
      onClose();
    } catch (error) {
      console.error(error);
      toast.error(error.response?.data?.message || 'Failed to add subtask');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/10 z-50">
      <form 
        onSubmit={handleSubmit} 
        className="bg-white p-6 rounded-lg w-full max-w-md shadow-lg space-y-4"
      >
        <h2 className="text-xl font-bold">Add Subtask</h2>
        
        <div>
          <label className="font-semibold">Main Task</label>
          <input
            type="text"
            value={task.title}
            readOnly
            className="w-full p-2 border rounded mt-1 "
          />
        </div>

        <div>
          <label className="font-semibold">Date</label>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        <div>
          <label className="font-semibold">Description</label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="w-full p-2 border rounded mt-1"
            required
          />
        </div>

        <div>
          <label className="font-semibold">Status</label>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full p-2 border rounded mt-1"
          >
            {statusOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="font-semibold">Hours to spend</label>
          <input
            type="number"
            min="0"
            value={hoursSpent}
            onChange={(e) => setHoursSpent(e.target.value)}
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        <div>
          <label className="font-semibold">Remarks</label>
          <textarea
            value={remarks}
            onChange={(e) => setRemarks(e.target.value)}
            className="w-full p-2 border rounded mt-1"
          />
        </div>

        <div className="flex justify-end gap-2 mt-4">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >
            {loading ? 'Adding...' : 'Add Progress'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddSubTaskForm;
