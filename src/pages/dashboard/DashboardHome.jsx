import { useState } from 'react';
import { MdCheckCircle, MdAccessTime, MdMoreHoriz } from 'react-icons/md';
import DashboardLayout from '@/layouts/DashboardLayout';

export default function DashboardHome() {
  const [activeProject, setActiveProject] = useState(0);

  const tasks = [
    {
      id: 1,
      name: 'ClientOnboarding - Circle',
      admin: 'Samanta J.',
      members: 3,
      status: 'In progress',
      runtime: '6 hours',
      finishDate: '6 Mon',
    },
    {
      id: 2,
      name: 'Meeting with Webflow & Notion',
      admin: 'Bob P.',
      members: 4,
      status: 'Done',
      runtime: '2 hours',
      finishDate: '7 Tue',
    },
    {
      id: 3,
      name: 'First Handoff with Engineers',
      admin: 'Kate O.',
      members: 10,
      status: 'In progress',
      runtime: '3 days',
      finishDate: '10 Fri',
    },
    {
      id: 4,
      name: 'Client Drafting (2) with Lawrence',
      admin: 'Jack F.',
      members: 7,
      status: 'In progress',
      runtime: '1 week',
      finishDate: '19 Sun',
    },
  ];

  const projects = [
    {
      id: 1,
      title: 'Improve cards readability',
      category: 'Design System',
      tags: ['Feedback', 'Bug', 'Design System'],
      date: '21.03.22',
      comments: 12,
      likes: 6,
      avatars: ['EJ', 'BP', 'KO'],
    },
    {
      id: 2,
      title: 'New Dashboard Features',
      category: 'Features',
      tags: ['Feature', 'Development'],
      date: '22.03.22',
      comments: 8,
      likes: 4,
      avatars: ['JF', 'SJ', 'BP'],
    },
    {
      id: 3,
      title: 'API Integration Cleanup',
      category: 'Backend',
      tags: ['Bug', 'Backend'],
      date: '23.03.22',
      comments: 15,
      likes: 9,
      avatars: ['KO', 'EJ', 'JF'],
    },
  ];

  const getStatusColor = (status) => {
    return status === 'Done' ? '#00B894' : '#FFA500';
  };

  const getStatusIcon = (status) => {
    return status === 'Done' ? <MdCheckCircle size={18} /> : <MdAccessTime size={18} />;
  };

  return (
    <DashboardLayout>
      <div className="space-y-6" style={{ fontFamily: 'Poppins, sans-serif' }}>
        {/* Last Tasks Section */}
        <div className="bg-white rounded-2xl shadow-sm p-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900 mb-1">Last tasks</h2>
              <p className="text-gray-500 text-sm">117 total, proceed to resolve them</p>
            </div>
            <div className="flex gap-8">
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">94</p>
                <p className="text-xs text-gray-500 mt-1">Done</p>
              </div>
              <div className="text-center">
                <p className="text-4xl font-bold text-gray-900">23</p>
                <p className="text-xs text-gray-500 mt-1">In progress</p>
              </div>
            </div>
          </div>

          {/* Tasks Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-gray-200">
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Name</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Admin</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Members</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Status</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Run time</th>
                  <th className="text-left py-3 px-4 text-gray-600 font-semibold">Finish date</th>
                </tr>
              </thead>
              <tbody>
                {tasks.map((task) => (
                  <tr key={task.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="py-4 px-4 text-gray-900 font-medium">{task.name}</td>
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-6 h-6 rounded-full bg-gradient-to-br from-purple-400 to-blue-400 flex items-center justify-center text-white text-xs font-bold">
                          {task.admin.charAt(0)}
                        </div>
                        <span className="text-gray-700">{task.admin}</span>
                      </div>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{task.members}</td>
                    <td className="py-4 px-4">
                      <span className="flex items-center gap-2 font-medium" style={{ color: getStatusColor(task.status) }}>
                        {getStatusIcon(task.status)}
                        {task.status}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-gray-700">{task.runtime}</td>
                    <td className="py-4 px-4 text-gray-700">{task.finishDate}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="grid grid-cols-2 gap-6">
          {/* Productivity Chart */}
          <div className="bg-white rounded-2xl shadow-sm p-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">Productivity</h3>
                <div className="flex gap-6">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#00B894' }}></div>
                    <span className="text-xs font-medium text-gray-600">Research</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: '#6C5CE7' }}></div>
                    <span className="text-xs font-medium text-gray-600">Design</span>
                  </div>
                </div>
              </div>
              <select className="text-xs text-gray-600 border border-gray-300 rounded px-2 py-1 focus:outline-none" style={{ focusRing: '#6C5CE7' }}>
                <option>01-07 May</option>
              </select>
            </div>

            {/* Chart Placeholder */}
            <div className="h-48 bg-gradient-to-b from-blue-50 to-purple-50 rounded-lg flex items-end justify-around px-4 py-8">
              {[2.5, 3.8, 3.5, 4.2, 3.9, 3.2, 2.8].map((height, i) => (
                <div key={i} className="w-6 rounded-t-md transition-all duration-200 hover:bg-opacity-80" style={{ height: `${height * 30}%`, backgroundColor: i % 2 === 0 ? '#00B894' : '#6C5CE7' }}></div>
              ))}
            </div>

            <p className="text-xs text-gray-500 text-center mt-4">Data updates every 3 hours</p>
          </div>

          {/* Projects in Progress */}
          <div className="bg-gray-900 rounded-2xl shadow-sm p-8 text-white">
            <h3 className="text-lg font-bold mb-4">Projects in progress:</h3>

            {/* Project Carousel */}
            <div className="relative">
              <div className="bg-white rounded-lg p-4 mb-4">
                <div className="flex justify-between items-start mb-3">
                  <h4 className="font-semibold text-gray-900">{projects[activeProject].title}</h4>
                  <button className="text-gray-400 hover:text-gray-600">
                    <MdMoreHoriz size={20} />
                  </button>
                </div>

                <div className="flex gap-1.5 mb-4">
                  {projects[activeProject].tags.map((tag, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-full text-xs font-medium"
                      style={{
                        backgroundColor: i === 1 ? '#00B894' : i === 2 ? '#6C5CE7' : '#f0f0f0',
                        color: i !== 2 ? 'white' : '#6C5CE7',
                      }}
                    >
                      {tag}
                    </span>
                  ))}
                </div>

                <div className="flex justify-between items-center text-gray-600 text-xs">
                  <span>{projects[activeProject].date}</span>
                  <div className="flex gap-4">
                    <span className="flex items-center gap-1">
                      <span>💬 {projects[activeProject].comments}</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span>❤️ {projects[activeProject].likes}</span>
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 mt-4 pt-4 border-t border-gray-200">
                  {projects[activeProject].avatars.map((avatar, i) => (
                    <div
                      key={i}
                      className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white"
                      style={{ backgroundColor: ['#FF6B6B', '#4ECDC4', '#FFE66D'][i] }}
                    >
                      {avatar}
                    </div>
                  ))}
                </div>
              </div>

              {/* Navigation Button */}
              <button
                onClick={() => setActiveProject((prev) => (prev + 1) % projects.length)}
                className="absolute right-0 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white text-gray-900 flex items-center justify-center hover:bg-opacity-80 transition-all"
              >
                →
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
