import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { taskService } from '../../services/tasks';

// Async Thunks
export const fetchTasks = createAsyncThunk(
  'tasks/fetchTasks',
  async (params, { rejectWithValue }) => {
    try {
      const response = await taskService.getTasks(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch tasks');
    }
  }
);
export const updateTask = createAsyncThunk(
  'tasks/updateTask',
  async ({ taskId, taskData }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(taskId, taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);

// Delete Task
export const deleteTask = createAsyncThunk(
  'tasks/deleteTask',
  async (taskId, { rejectWithValue }) => {
    try {
      const response = await taskService.deleteTask(taskId);
      return { taskId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete task');
    }
  }
);
export const createTask = createAsyncThunk(
  'tasks/createTask',
  async (taskData, { rejectWithValue }) => {
    try {
      const response = await taskService.createTask(taskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create task');
    }
  }
);

// Add subtask to task - FIXED
export const addSubTask = createAsyncThunk(
  'tasks/addSubTask',
  async ({ taskId, subTaskData }, { rejectWithValue }) => {
    try {
      // subTaskData should contain: date, description, status, hoursSpent, remarks
      const res = await taskService.addSubTask(taskId, subTaskData);
      return res.data;
    } catch (e) {
      return rejectWithValue(e.response?.data?.message || 'Failed to add subtask');
    }
  }
);


// Update Subtask
export const updateSubTask = createAsyncThunk(
  'tasks/updateSubTask',
  async ({ taskId, subTaskId, subTaskData }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateSubTask(taskId, subTaskId, subTaskData);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update subtask');
    }
  }
);

// Delete Subtask
export const deleteSubTask = createAsyncThunk(
  'tasks/deleteSubTask',
  async ({ taskId, subTaskId }, { rejectWithValue }) => {
    try {
      const response = await taskService.deleteSubTask(taskId, subTaskId);
      return { taskId, subTaskId, ...response.data };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete subtask');
    }
  }
);




export const updateTaskStatus = createAsyncThunk(
  'tasks/updateTaskStatus',
  async ({ taskId, status }, { rejectWithValue }) => {
    try {
      const response = await taskService.updateTask(taskId, { status });
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update task');
    }
  }
);


export const fetchReport = createAsyncThunk(
  'tasks/fetchReport',


  async (params, { rejectWithValue }) => {
    try {
      const response = await taskService.getReport(params);
      return response.data;
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch report');
    }
  }
);

export const exportToExcel = createAsyncThunk(
  'tasks/exportToExcel',
  async (params, { rejectWithValue }) => {
    try {
      const response = await taskService.exportToExcel(params);
      
      // DEBUG: Log all headers
      console.log('Response headers:', response.headers);
      console.log('Content-Disposition header:', response.headers['content-disposition']);
      
      // Create download link
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      
      // Extract filename from Content-Disposition header
      const contentDisposition = response.headers['content-disposition'];
      let fileName = 'tasks_report.xlsx';
      
      if (contentDisposition) {
        console.log('Raw Content-Disposition:', contentDisposition);
        const fileNameMatch = contentDisposition.match(/filename="?([^"]+)"?/);
        // console.log('Filename match:', fileNameMatch);
        if (fileNameMatch && fileNameMatch.length >= 2) {
          fileName = fileNameMatch[1];
        }
      }
      
      // console.log('Final filename:', fileName);
      
      link.setAttribute('download', fileName);
      document.body.appendChild(link);
      link.click();
      link.remove();
      
      return { success: true };
    } catch (error) {
      return rejectWithValue(error.response?.data?.message || 'Failed to export report');
    }
  }
);
const taskSlice = createSlice({
  name: 'tasks',
  initialState: {
    tasks: [],
    dashboardStats: null,
    report: null,
    isLoading: false,
    error: null,
    totalPages: 1,
    currentPage: 1,
    totalTasks: 0
  },
  reducers: {
    clearTasks: (state) => {
      state.tasks = [];
    },
    clearReport: (state) => {
      state.report = null;
    },
    updateSubTaskLocal: (state, action) => {
      const { taskId, subTaskId, updates } = action.payload;
      const task = state.tasks.find(t => t._id === taskId);
      if (task) {
        const subTask = task.subTasks.find(st => st._id === subTaskId);
        if (subTask) {
          Object.assign(subTask, updates);
          
          // Recalculate progress
          const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
          task.progress = Math.round((completedSubTasks / task.subTasks.length) * 100);
          
          // Update overall status
          if (task.progress === 100) {
            task.status = 'completed';
          } else if (task.progress > 0) {
            task.status = 'in-progress';
          }
        }
      }
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch Tasks
      .addCase(fetchTasks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchTasks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks = action.payload.tasks;
        state.totalPages = action.payload.pages;
        state.currentPage = action.payload.page;
        state.totalTasks = action.payload.total;
      })
      .addCase(fetchTasks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Create Task
      .addCase(createTask.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createTask.fulfilled, (state, action) => {
        state.isLoading = false;
        state.tasks.unshift(action.payload.task);
      })
      .addCase(createTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      
      // Fetch Report
      .addCase(fetchReport.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchReport.fulfilled, (state, action) => {
        state.isLoading = false;
        state.report = action.payload;
      })
      .addCase(fetchReport.rejected, (state) => {
        state.isLoading = false;
      });

      // Add subtask cases
    builder
      .addCase(addSubTask.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(addSubTask.fulfilled, (state, action) => {
        state.isLoading = false;
        // Find the task and add the subtask
        const taskIndex = state.tasks.findIndex(task => task._id === action.payload.taskId);
        if (taskIndex !== -1) {
          state.tasks[taskIndex].subTasks.push(action.payload.subTask);
        }
      })
      .addCase(addSubTask.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
          // Update Task
    .addCase(updateTask.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(updateTask.fulfilled, (state, action) => {
      state.isLoading = false;
      const index = state.tasks.findIndex(task => task._id === action.payload.task._id);
      if (index !== -1) {
        state.tasks[index] = action.payload.task;
      }
    })
    .addCase(updateTask.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    
    // Delete Task
    .addCase(deleteTask.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(deleteTask.fulfilled, (state, action) => {
      state.isLoading = false;
      state.tasks = state.tasks.filter(task => task._id !== action.payload.taskId);
    })
    .addCase(deleteTask.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
        // Update Subtask
    .addCase(updateSubTask.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(updateSubTask.fulfilled, (state, action) => {
      state.isLoading = false;
      const { taskId, subTaskId } = action.payload;
      const task = state.tasks.find(t => t._id === taskId);
      if (task) {
        const subTaskIndex = task.subTasks.findIndex(st => st._id === subTaskId);
        if (subTaskIndex !== -1) {
          task.subTasks[subTaskIndex] = { ...task.subTasks[subTaskIndex], ...action.payload.updates };
          
          // Recalculate progress
          const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
          task.progress = Math.round((completedSubTasks / task.subTasks.length) * 100);
          
          // Update overall status
          if (task.progress === 100) {
            task.status = 'completed';
          } else if (task.progress > 0 && task.status === 'pending') {
            task.status = 'in-progress';
          }
        }
      }
    })
    .addCase(updateSubTask.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    })
    
    // Delete Subtask
    .addCase(deleteSubTask.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    })
    .addCase(deleteSubTask.fulfilled, (state, action) => {
      state.isLoading = false;
      const { taskId, subTaskId } = action.payload;
      const task = state.tasks.find(t => t._id === taskId);
      if (task) {
        task.subTasks = task.subTasks.filter(st => st._id !== subTaskId);
        
        // Recalculate progress
        const completedSubTasks = task.subTasks.filter(st => st.status === 'completed').length;
        task.progress = task.subTasks.length > 0 
          ? Math.round((completedSubTasks / task.subTasks.length) * 100)
          : 0;
      }
    })
    .addCase(deleteSubTask.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload;
    });


  }
});

export const { clearTasks, clearReport, updateSubTaskLocal } = taskSlice.actions;
export default taskSlice.reducer;