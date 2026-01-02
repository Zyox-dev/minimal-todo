import React, { useState, useEffect } from 'react';
import { Calendar, CheckSquare, Target, FileText, Plus, Check, Trash2, Edit2, X, Menu, Home } from 'lucide-react';

const ProductivityApp = () => {
  const [activeView, setActiveView] = useState('dashboard');
  const [tasks, setTasks] = useState([]);
  const [habits, setHabits] = useState([]);
  const [goals, setGoals] = useState([]);
  const [notes, setNotes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState('');
  const [editItem, setEditItem] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const stored = await window.storage.get('productivity-data');
      if (stored) {
        const data = JSON.parse(stored.value);
        setTasks(data.tasks || []);
        setHabits(data.habits || []);
        setGoals(data.goals || []);
        setNotes(data.notes || []);
      }
    } catch (err) {
      console.log('No data yet');
    }
  };

  const saveData = async (newTasks, newHabits, newGoals, newNotes) => {
    const data = {
      tasks: newTasks,
      habits: newHabits,
      goals: newGoals,
      notes: newNotes
    };
    await window.storage.set('productivity-data', JSON.stringify(data));
  };

  const openModal = (type, item = null) => {
    setModalType(type);
    setEditItem(item);
    if (item) {
      setFormData(item);
    } else {
      setFormData({});
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setModalType('');
    setEditItem(null);
    setFormData({});
  };

  const handleSubmit = async () => {
    const id = editItem?.id || Date.now().toString();
    const item = { ...formData, id };

    let newTasks = tasks;
    let newHabits = habits;
    let newGoals = goals;
    let newNotes = notes;

    if (modalType === 'task') {
      if (editItem) {
        newTasks = tasks.map(t => t.id === id ? item : t);
      } else {
        newTasks = [...tasks, { ...item, completed: false }];
      }
      setTasks(newTasks);
    } else if (modalType === 'habit') {
      if (editItem) {
        newHabits = habits.map(h => h.id === id ? item : h);
      } else {
        newHabits = [...habits, { ...item, streak: 0, completedToday: false }];
      }
      setHabits(newHabits);
    } else if (modalType === 'goal') {
      if (editItem) {
        newGoals = goals.map(g => g.id === id ? item : g);
      } else {
        newGoals = [...goals, { ...item, progress: 0 }];
      }
      setGoals(newGoals);
    } else if (modalType === 'note') {
      if (editItem) {
        newNotes = notes.map(n => n.id === id ? item : n);
      } else {
        newNotes = [...notes, { ...item, created: new Date().toISOString() }];
      }
      setNotes(newNotes);
    }

    await saveData(newTasks, newHabits, newGoals, newNotes);
    closeModal();
  };

  const deleteItem = async (type, id) => {
    let newTasks = tasks;
    let newHabits = habits;
    let newGoals = goals;
    let newNotes = notes;

    if (type === 'task') {
      newTasks = tasks.filter(t => t.id !== id);
      setTasks(newTasks);
    } else if (type === 'habit') {
      newHabits = habits.filter(h => h.id !== id);
      setHabits(newHabits);
    } else if (type === 'goal') {
      newGoals = goals.filter(g => g.id !== id);
      setGoals(newGoals);
    } else if (type === 'note') {
      newNotes = notes.filter(n => n.id !== id);
      setNotes(newNotes);
    }

    await saveData(newTasks, newHabits, newGoals, newNotes);
  };

  const toggleTask = async (id) => {
    const newTasks = tasks.map(t => 
      t.id === id ? { ...t, completed: !t.completed } : t
    );
    setTasks(newTasks);
    await saveData(newTasks, habits, goals, notes);
  };

  const toggleHabit = async (id) => {
    const newHabits = habits.map(h => {
      if (h.id === id) {
        const completedToday = !h.completedToday;
        const streak = completedToday ? h.streak + 1 : h.streak;
        return { ...h, completedToday, streak };
      }
      return h;
    });
    setHabits(newHabits);
    await saveData(tasks, newHabits, goals, notes);
  };

  const updateGoalProgress = async (id, progress) => {
    const newGoals = goals.map(g => 
      g.id === id ? { ...g, progress: Math.min(100, Math.max(0, progress)) } : g
    );
    setGoals(newGoals);
    await saveData(tasks, habits, newGoals, notes);
  };

  const getTodayDate = () => {
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const now = new Date();
    return {
      day: days[now.getDay()],
      date: now.getDate(),
      month: months[now.getMonth()]
    };
  };

  const today = getTodayDate();
  const completionRate = tasks.length > 0 
    ? Math.round((tasks.filter(t => t.completed).length / tasks.length) * 100) 
    : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Dashboard View */}
      {activeView === 'dashboard' && (
        <div className="max-w-md mx-auto p-4 space-y-4">
          {/* Date and Progress Cards */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="text-sm text-gray-500 mb-1">{today.day} {today.month}</div>
              <div className="text-6xl font-bold">{today.date}</div>
            </div>
            <div className="bg-white rounded-3xl p-6 shadow-sm">
              <div className="flex items-center justify-between mb-2">
                <div className="text-sm text-gray-500">Day</div>
                <div className="text-sm font-semibold">{completionRate}%</div>
              </div>
              <div className="grid grid-cols-6 gap-1">
                {[...Array(30)].map((_, i) => (
                  <div
                    key={i}
                    className={`w-2 h-2 rounded-full ${
                      i < (completionRate / 100 * 30) ? 'bg-black' : 'bg-gray-200'
                    }`}
                  />
                ))}
              </div>
            </div>
          </div>

          {/* Favorites */}
          <div className="bg-white rounded-3xl p-6 shadow-sm">
            <div className="text-sm text-gray-500 mb-4">Favorites</div>
            <div className="space-y-3">
              <button
                onClick={() => setActiveView('habits')}
                className="flex items-center w-full text-left"
              >
                <Calendar className="w-5 h-5 mr-3" />
                <span className="font-medium">Habits</span>
              </button>
              <button
                onClick={() => setActiveView('tasks')}
                className="flex items-center w-full text-left"
              >
                <CheckSquare className="w-5 h-5 mr-3" />
                <span className="font-medium">Daily Tasks</span>
              </button>
              <button
                onClick={() => setActiveView('goals')}
                className="flex items-center w-full text-left"
              >
                <Target className="w-5 h-5 mr-3" />
                <span className="font-medium">Goals</span>
              </button>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => setActiveView('notes')}
              className="bg-white rounded-3xl p-8 shadow-sm text-left"
            >
              <FileText className="w-8 h-8 mb-3" />
              <div className="font-bold text-xl">Quick Notes</div>
            </button>
            <button
              onClick={() => setActiveView('tasks')}
              className="bg-white rounded-3xl p-8 shadow-sm text-left"
            >
              <CheckSquare className="w-8 h-8 mb-3" />
              <div className="font-bold text-xl">Daily Tasks</div>
            </button>
          </div>

          {/* Bottom Navigation */}
          <div className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-4">
            <div className="max-w-md mx-auto flex justify-around">
              <button onClick={() => setActiveView('dashboard')} className="p-3">
                <Home className="w-6 h-6" />
              </button>
              <button onClick={() => setActiveView('tasks')} className="p-3">
                <CheckSquare className="w-6 h-6" />
              </button>
              <button onClick={() => setActiveView('habits')} className="p-3">
                <Calendar className="w-6 h-6" />
              </button>
              <button onClick={() => setActiveView('goals')} className="p-3">
                <Target className="w-6 h-6" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Tasks View */}
      {activeView === 'tasks' && (
        <div className="max-w-md mx-auto p-4 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button onClick={() => setActiveView('dashboard')} className="mr-3">
                <X className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold">Tasks</h1>
            </div>
            <button
              onClick={() => openModal('task')}
              className="bg-black text-white p-2 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {tasks.map(task => (
              <div key={task.id} className="bg-white rounded-2xl p-4 shadow-sm flex items-center justify-between">
                <div className="flex items-center flex-1">
                  <button
                    onClick={() => toggleTask(task.id)}
                    className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                      task.completed ? 'bg-black border-black' : 'border-gray-300'
                    }`}
                  >
                    {task.completed && <Check className="w-4 h-4 text-white" />}
                  </button>
                  <div className={task.completed ? 'line-through text-gray-400' : ''}>
                    <div className="font-medium">{task.title}</div>
                    {task.description && (
                      <div className="text-sm text-gray-500">{task.description}</div>
                    )}
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <button onClick={() => openModal('task', task)}>
                    <Edit2 className="w-4 h-4 text-gray-400" />
                  </button>
                  <button onClick={() => deleteItem('task', task.id)}>
                    <Trash2 className="w-4 h-4 text-gray-400" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Habits View */}
      {activeView === 'habits' && (
        <div className="max-w-md mx-auto p-4 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button onClick={() => setActiveView('dashboard')} className="mr-3">
                <X className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold">Habits</h1>
            </div>
            <button
              onClick={() => openModal('habit')}
              className="bg-black text-white p-2 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {habits.map(habit => (
              <div key={habit.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center flex-1">
                    <button
                      onClick={() => toggleHabit(habit.id)}
                      className={`w-6 h-6 rounded-full border-2 mr-3 flex items-center justify-center ${
                        habit.completedToday ? 'bg-black border-black' : 'border-gray-300'
                      }`}
                    >
                      {habit.completedToday && <Check className="w-4 h-4 text-white" />}
                    </button>
                    <div>
                      <div className="font-medium">{habit.name}</div>
                      <div className="text-sm text-gray-500">🔥 {habit.streak} day streak</div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => openModal('habit', habit)}>
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => deleteItem('habit', habit.id)}>
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Goals View */}
      {activeView === 'goals' && (
        <div className="max-w-md mx-auto p-4 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button onClick={() => setActiveView('dashboard')} className="mr-3">
                <X className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold">Goals</h1>
            </div>
            <button
              onClick={() => openModal('goal')}
              className="bg-black text-white p-2 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {goals.map(goal => (
              <div key={goal.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex-1">
                    <div className="font-medium">{goal.title}</div>
                    {goal.description && (
                      <div className="text-sm text-gray-500">{goal.description}</div>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <button onClick={() => openModal('goal', goal)}>
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => deleteItem('goal', goal.id)}>
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-500">Progress</span>
                    <span className="font-medium">{goal.progress}%</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div
                      className="bg-black h-2 rounded-full transition-all"
                      style={{ width: `${goal.progress}%` }}
                    />
                  </div>
                  <div className="flex space-x-2 mt-2">
                    <button
                      onClick={() => updateGoalProgress(goal.id, goal.progress - 10)}
                      className="px-3 py-1 bg-gray-100 rounded-lg text-sm"
                    >
                      -10%
                    </button>
                    <button
                      onClick={() => updateGoalProgress(goal.id, goal.progress + 10)}
                      className="px-3 py-1 bg-gray-100 rounded-lg text-sm"
                    >
                      +10%
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes View */}
      {activeView === 'notes' && (
        <div className="max-w-md mx-auto p-4 pb-20">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center">
              <button onClick={() => setActiveView('dashboard')} className="mr-3">
                <X className="w-6 h-6" />
              </button>
              <h1 className="text-2xl font-bold">Notes</h1>
            </div>
            <button
              onClick={() => openModal('note')}
              className="bg-black text-white p-2 rounded-full"
            >
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="space-y-2">
            {notes.map(note => (
              <div key={note.id} className="bg-white rounded-2xl p-4 shadow-sm">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="font-medium mb-1">{note.title}</div>
                    <div className="text-sm text-gray-600 whitespace-pre-wrap">{note.content}</div>
                  </div>
                  <div className="flex items-center space-x-2 ml-2">
                    <button onClick={() => openModal('note', note)}>
                      <Edit2 className="w-4 h-4 text-gray-400" />
                    </button>
                    <button onClick={() => deleteItem('note', note.id)}>
                      <Trash2 className="w-4 h-4 text-gray-400" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold">
                {editItem ? 'Edit' : 'Add'} {modalType.charAt(0).toUpperCase() + modalType.slice(1)}
              </h2>
              <button onClick={closeModal}>
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="space-y-4">
              {modalType === 'task' && (
                <>
                  <input
                    type="text"
                    placeholder="Task title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                    rows="3"
                  />
                </>
              )}

              {modalType === 'habit' && (
                <input
                  type="text"
                  placeholder="Habit name"
                  value={formData.name || ''}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                  required
                />
              )}

              {modalType === 'goal' && (
                <>
                  <input
                    type="text"
                    placeholder="Goal title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                  <textarea
                    placeholder="Description (optional)"
                    value={formData.description || ''}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                    rows="3"
                  />
                </>
              )}

              {modalType === 'note' && (
                <>
                  <input
                    type="text"
                    placeholder="Note title"
                    value={formData.title || ''}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                    required
                  />
                  <textarea
                    placeholder="Note content"
                    value={formData.content || ''}
                    onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                    className="w-full px-4 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black"
                    rows="5"
                    required
                  />
                </>
              )}

              <div className="flex space-x-3">
                <button
                  type="button"
                  onClick={closeModal}
                  className="flex-1 px-4 py-3 rounded-xl bg-gray-100 font-medium"
                >
                  Cancel
                </button>
                <button
                  type="button"
                  onClick={handleSubmit}
                  className="flex-1 px-4 py-3 rounded-xl bg-black text-white font-medium"
                >
                  {editItem ? 'Update' : 'Add'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProductivityApp;
