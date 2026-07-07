import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { PageHeader, LoadingSkeleton, EmptyState } from '../components/Common';
import { User, Tag, Plus, Trash2, Edit3, Save, BookOpen, Award, CheckCircle } from 'lucide-react';
import api from '../api/axios';

export default function Profile() {
  const { user, updateProfile } = useAuth();
  const { showToast } = useToast();
  
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState('');
  const [bio, setBio] = useState('');
  const [major, setMajor] = useState('');
  const [graduationYear, setGraduationYear] = useState('');
  const [avatar, setAvatar] = useState('');
  
  // Skills offered/wanted managing
  const [skills, setSkills] = useState([]);
  const [newSkillName, setNewSkillName] = useState('');
  const [newSkillType, setNewSkillType] = useState('OFFERED'); // 'OFFERED' or 'WANTED'
  
  const [reputationLogs, setReputationLogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      setName(user.profile?.name || '');
      setBio(user.profile?.bio || '');
      setMajor(user.profile?.major || '');
      setGraduationYear(user.profile?.graduationYear || '');
      setAvatar(user.profile?.avatar || '');
      
      // Fetch full profile info with skills and reputation scores
      api.get(`/auth/profile/${user.id}`)
        .then(res => {
          setSkills(res.data.profile?.skills || []);
          setReputationLogs(res.data.reputationScores || []);
        })
        .catch(err => console.error('Error fetching profile detail:', err))
        .finally(() => setLoading(false));
    }
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) {
      showToast('Name is required.', 'warning');
      return;
    }

    const payload = {
      name,
      bio,
      major,
      graduationYear: graduationYear ? parseInt(graduationYear) : null,
      avatar,
      // Map local skill states to save
      skills: skills.map(s => ({ name: s.name, type: s.type }))
    };

    const res = await updateProfile(payload);
    if (res.success) {
      showToast('Profile updated successfully.', 'success');
      setIsEditing(false);
    } else {
      showToast(res.error, 'error');
    }
  };

  const handleAddSkill = () => {
    if (!newSkillName.trim()) {
      showToast('Skill name cannot be empty.', 'warning');
      return;
    }

    const exists = skills.some(s => s.name.toLowerCase() === newSkillName.trim().toLowerCase() && s.type === newSkillType);
    if (exists) {
      showToast('Skill already added to list.', 'warning');
      return;
    }

    setSkills(prev => [...prev, { id: Math.random(), name: newSkillName.trim(), type: newSkillType }]);
    setNewSkillName('');
    showToast(`Added skill: "${newSkillName}"`, 'success');
  };

  const handleRemoveSkill = (id) => {
    setSkills(prev => prev.filter(s => s.id !== id));
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <LoadingSkeleton type="list" count={4} />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col gap-8 text-left">
      <PageHeader title="My Profile" subtitle="Manage your campus information and reputation settings" icon={User} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Profile Card View / Edit Column */}
        <div className="lg:col-span-1 flex flex-col gap-6">
          <div className="glass-card p-6 flex flex-col items-center text-center gap-4">
            <img
              src={avatar || 'https://api.dicebear.com/7.x/adventurer/svg?seed=avatar'}
              alt="Avatar"
              className="w-24 h-24 rounded-full bg-orange-100 dark:bg-slate-800 object-cover border border-gray-200"
            />
            
            {!isEditing ? (
              <div className="flex flex-col gap-1 items-center">
                <h3 className="text-xl font-bold text-black dark:text-white flex items-center gap-1 leading-snug">
                  {name}
                </h3>
                <span className="text-xs font-semibold text-primary px-2.5 py-0.5 rounded-full bg-orange-50 dark:bg-orange-950/20 border border-orange-500/10 mt-1">
                  {user.role}
                </span>
                <p className="text-xs text-gray-700 dark:text-gray-400 font-medium mt-2">
                  {major ? `${major} • ` : ''} Class of {graduationYear || 'N/A'}
                </p>
                <p className="text-xs text-gray-600 dark:text-slate-400 font-medium mt-3 italic px-4 leading-relaxed">
                  "{bio || 'No bio written yet.'}"
                </p>
                
                <button
                  onClick={() => setIsEditing(true)}
                  className="mt-5 inline-flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-lg border border-gray-200 dark:border-slate-800 text-[#374151] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                >
                  <Edit3 className="w-3.5 h-3.5" /> Edit Profile
                </button>
              </div>
            ) : (
              <form onSubmit={handleSave} className="w-full flex flex-col gap-4 text-left">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Avatar URL</label>
                  <input
                    type="text"
                    value={avatar}
                    onChange={(e) => setAvatar(e.target.value)}
                    placeholder="https://api.dicebear.com/..."
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Full Name *</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-black dark:text-white focus:outline-none"
                    required
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Major</label>
                  <input
                    type="text"
                    value={major}
                    placeholder="e.g. Computer Science"
                    onChange={(e) => setMajor(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Graduation Year</label>
                  <input
                    type="number"
                    value={graduationYear}
                    placeholder="e.g. 2027"
                    onChange={(e) => setGraduationYear(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-black dark:text-white focus:outline-none"
                  />
                </div>

                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase">Bio</label>
                  <textarea
                    value={bio}
                    placeholder="Write a brief intro..."
                    onChange={(e) => setBio(e.target.value)}
                    className="w-full px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-905 text-black dark:text-white focus:outline-none h-20 resize-none"
                  />
                </div>

                <div className="flex gap-2.5 mt-2">
                  <button
                    type="submit"
                    className="flex-grow btn-primary py-2 text-xs rounded-xl"
                  >
                    <Save className="w-3.5 h-3.5" /> Save Profile
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setIsEditing(false);
                      // Restore original
                      setName(user.profile?.name || '');
                      setBio(user.profile?.bio || '');
                      setMajor(user.profile?.major || '');
                      setGraduationYear(user.profile?.graduationYear || '');
                      setAvatar(user.profile?.avatar || '');
                    }}
                    className="px-4 py-2 text-xs font-bold rounded-xl border border-gray-200 dark:border-slate-800 hover:bg-slate-50 text-black dark:text-slate-200 transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>

        {/* Skills Management & Reputation History */}
        <div className="lg:col-span-2 flex flex-col gap-6">
          
          {/* Skills Exchange Settings */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="font-bold text-lg text-black dark:text-white flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-primary" /> Skill Profile Tags
            </h3>

            {/* Skills Lists */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
              {/* Skills Offered */}
              <div className="flex flex-col gap-2 text-left">
                <span className="text-xs font-bold text-green-600 uppercase tracking-wider">Skills Offered (Teach)</span>
                <div className="flex flex-wrap gap-2 min-h-16 p-3 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
                  {skills.filter(s => s.type === 'OFFERED').length === 0 ? (
                    <span className="text-xs text-gray-600 my-auto">No teaching tags added.</span>
                  ) : (
                    skills.filter(s => s.type === 'OFFERED').map(s => (
                      <span key={s.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-xl bg-green-500/10 border border-green-550/10 text-green-700 dark:text-green-300 font-semibold">
                        {s.name}
                        {isEditing && (
                          <button onClick={() => handleRemoveSkill(s.id)} className="p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"><Trash2 className="w-3 h-3 text-red-500" /></button>
                        )}
                      </span>
                    ))
                  )}
                </div>
              </div>

              {/* Skills Wanted */}
              <div className="flex flex-col gap-2 text-left">
                <span className="text-xs font-bold text-blue-600 uppercase tracking-wider">Skills Wanted (Learn)</span>
                <div className="flex flex-wrap gap-2 min-h-16 p-3 rounded-xl border border-dashed border-gray-200 dark:border-slate-800">
                  {skills.filter(s => s.type === 'WANTED').length === 0 ? (
                    <span className="text-xs text-gray-600 my-auto">No learning tags added.</span>
                  ) : (
                    skills.filter(s => s.type === 'WANTED').map(s => (
                      <span key={s.id} className="inline-flex items-center gap-1.5 px-2.5 py-1 text-xs rounded-xl bg-blue-500/10 border border-blue-550/10 text-blue-700 dark:text-blue-300 font-semibold">
                        {s.name}
                        {isEditing && (
                          <button onClick={() => handleRemoveSkill(s.id)} className="p-0.5 hover:bg-black/5 dark:hover:bg-white/5 rounded-full"><Trash2 className="w-3 h-3 text-red-500" /></button>
                        )}
                      </span>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Quick Add Skills */}
            {isEditing && (
              <div className="flex gap-2 items-center">
                <input
                  type="text"
                  placeholder="Add skill tag (e.g. Python)"
                  value={newSkillName}
                  onChange={(e) => setNewSkillName(e.target.value)}
                  className="flex-1 px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-black dark:text-white focus:outline-none"
                />
                <select
                  value={newSkillType}
                  onChange={(e) => setNewSkillType(e.target.value)}
                  className="px-3 py-2 text-xs rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-black dark:text-white focus:outline-none font-semibold"
                >
                  <option value="OFFERED">Offer</option>
                  <option value="WANTED">Want</option>
                </select>
                <button
                  type="button"
                  onClick={handleAddSkill}
                  className="p-2 rounded-xl bg-primary hover:bg-primary-dark text-white text-xs font-bold"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>

          {/* Reputation Log history */}
          <div className="glass-card p-6 flex flex-col gap-4">
            <h3 className="font-bold text-lg text-black dark:text-white flex items-center gap-2">
              <Award className="w-5 h-5 text-primary" /> Reputation Milestones
            </h3>
            
            {reputationLogs.length === 0 ? (
              <EmptyState icon={Award} title="No achievements yet" description="Points are awarded as you complete trade transactions and skill exchanges." />
            ) : (
              <div className="flex flex-col gap-3 max-h-60 overflow-y-auto pr-1">
                {reputationLogs.map(log => (
                  <div key={log.id} className="flex justify-between items-center p-3.5 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-gray-200 dark:border-slate-800">
                    <div className="flex flex-col gap-0.5 text-left">
                      <span className="text-xs font-bold text-black dark:text-slate-200">{log.details || 'Reputation award'}</span>
                      <span className="text-[10px] text-gray-600 dark:text-slate-500 font-semibold">{log.category} • {new Date(log.createdAt).toLocaleDateString()}</span>
                    </div>
                    <span className={`text-sm font-extrabold px-2 py-0.5 rounded-lg ${log.score >= 0 ? 'bg-green-500/10 text-green-600' : 'bg-red-500/10 text-red-500'}`}>
                      {log.score >= 0 ? `+${log.score}` : log.score}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
