import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import {
  getProfile,
  updateProfile,
  saveBackground,
  updateGoals,
} from './profileApi';
import type { UpdateProfileRequest, BackgroundRequest, GoalsRequest } from './types';
import LoadingSpinner from '../../components/LoadingSpinner';
import ErrorMessage from '../../components/ErrorMessage';

type Tab = 'profile' | 'background' | 'goals';

export default function ProfilePage() {
  const [activeTab, setActiveTab] = useState<Tab>('profile');

  return (
    <div style={styles.page}>
      <div style={styles.header}>
        <h1 style={styles.heading}>👤 My Profile</h1>
        <p style={styles.subtitle}>Manage your personal information and cycling goals</p>
      </div>
      <div style={styles.tabs}>
        {(['profile', 'background', 'goals'] as Tab[]).map((tab) => (
          <button
            key={tab}
            style={{
              ...styles.tab,
              ...(activeTab === tab ? styles.tabActive : {}),
            }}
            onClick={() => setActiveTab(tab)}
          >
            {tab === 'profile' ? '📋 Profile Info' : tab === 'background' ? '🏋️ Training Background' : '🎯 Goals'}
          </button>
        ))}
      </div>
      <div style={styles.tabContent}>
        {activeTab === 'profile' && <ProfileInfoTab />}
        {activeTab === 'background' && <BackgroundTab />}
        {activeTab === 'goals' && <GoalsTab />}
      </div>
    </div>
  );
}

function ProfileInfoTab() {
  const queryClient = useQueryClient();
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const { data, isLoading, isError } = useQuery({
    queryKey: ['profile'],
    queryFn: getProfile,
  });

  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['profile'] });
      setSuccessMsg('Profile updated successfully.');
    },
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<UpdateProfileRequest>({
    values: data
      ? {
          age: data.age ?? 0,
          weight: data.weight ?? 0,
          experienceLevel: data.experienceLevel ?? '',
        }
      : undefined,
  });

  if (isLoading) return <LoadingSpinner />;
  if (isError) return <ErrorMessage message="Failed to load profile." />;

  return (
    <div style={styles.card}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
        <div style={styles.field}>
          <label style={styles.label}>Age</label>
          <input
            style={styles.input}
            type="number"
            {...register('age', {
              required: 'Age is required',
              min: { value: 1, message: 'Min 1' },
              max: { value: 150, message: 'Max 150' },
              valueAsNumber: true,
            })}
          />
          {errors.age && <span style={styles.fieldError}>{errors.age.message}</span>}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Weight (kg)</label>
          <input
            style={styles.input}
            type="number"
            step="0.1"
            {...register('weight', {
              required: 'Weight is required',
              min: { value: 1, message: 'Min 1' },
              max: { value: 500, message: 'Max 500' },
              valueAsNumber: true,
            })}
          />
          {errors.weight && <span style={styles.fieldError}>{errors.weight.message}</span>}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Experience Level</label>
          <select style={styles.input} {...register('experienceLevel', { required: 'Required' })}>
            <option value="">Select…</option>
            <option value="BEGINNER">Beginner</option>
            <option value="INTERMEDIATE">Intermediate</option>
            <option value="ADVANCED">Advanced</option>
          </select>
          {errors.experienceLevel && (
            <span style={styles.fieldError}>{errors.experienceLevel.message}</span>
          )}
        </div>

        {mutation.isError && <ErrorMessage message="Failed to update profile." />}
        {successMsg && <div style={styles.success}>{successMsg}</div>}

        <button style={styles.button} type="submit" disabled={isSubmitting || mutation.isPending}>
          💾 Save Profile
        </button>
      </form>
    </div>
  );
}

function BackgroundTab() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: saveBackground,
    onSuccess: () => setSuccessMsg('Training background saved.'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<BackgroundRequest>();

  return (
    <div style={styles.card}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
        <div style={styles.field}>
          <label style={styles.label}>Years Training</label>
          <input
            style={styles.input}
            type="number"
            {...register('yearsTraining', { required: 'Required', min: 0, valueAsNumber: true })}
          />
          {errors.yearsTraining && (
            <span style={styles.fieldError}>{errors.yearsTraining.message}</span>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Weekly Volume (km)</label>
          <input
            style={styles.input}
            type="number"
            {...register('weeklyVolume', { required: 'Required', min: 0, valueAsNumber: true })}
          />
          {errors.weeklyVolume && (
            <span style={styles.fieldError}>{errors.weeklyVolume.message}</span>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Recent Injuries</label>
          <textarea
            style={{ ...styles.input, height: '80px', resize: 'vertical' }}
            {...register('recentInjuries', { required: 'Required' })}
          />
          {errors.recentInjuries && (
            <span style={styles.fieldError}>{errors.recentInjuries.message}</span>
          )}
        </div>

        <div style={styles.field}>
          <label style={styles.label}>Prior Events / Achievements</label>
          <textarea
            style={{ ...styles.input, height: '80px', resize: 'vertical' }}
            {...register('priorEvents', { required: 'Required' })}
          />
          {errors.priorEvents && (
            <span style={styles.fieldError}>{errors.priorEvents.message}</span>
          )}
        </div>

        {mutation.isError && <ErrorMessage message="Failed to save background." />}
        {successMsg && <div style={styles.success}>{successMsg}</div>}

        <button style={styles.button} type="submit" disabled={isSubmitting || mutation.isPending}>
          💾 Save Background
        </button>
      </form>
    </div>
  );
}

function GoalsTab() {
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: updateGoals,
    onSuccess: () => setSuccessMsg('Goals updated.'),
  });

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<GoalsRequest>();

  return (
    <div style={styles.card}>
      <form onSubmit={handleSubmit((d) => mutation.mutate(d))} noValidate>
        <div style={styles.field}>
          <label style={styles.label}>Training Goals</label>
          <textarea
            style={{ ...styles.input, height: '120px', resize: 'vertical' }}
            placeholder="e.g. Complete a 100km century ride by summer"
            {...register('goals', { required: 'Please describe your goals' })}
          />
          {errors.goals && <span style={styles.fieldError}>{errors.goals.message}</span>}
        </div>

        {mutation.isError && <ErrorMessage message="Failed to update goals." />}
        {successMsg && <div style={styles.success}>{successMsg}</div>}

        <button style={styles.button} type="submit" disabled={isSubmitting || mutation.isPending}>
          💾 Save Goals
        </button>
      </form>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { 
    maxWidth: '900px', 
    margin: '0 auto', 
    padding: '2rem 1.5rem' 
  },
  header: {
    marginBottom: '2rem',
    textAlign: 'center',
  },
  heading: {
    margin: '0 0 0.5rem',
    color: '#111827',
    fontSize: '2.5rem',
    fontWeight: 700,
  },
  subtitle: {
    margin: 0,
    color: '#6b7280',
    fontSize: '1.1rem',
  },
  tabs: { 
    display: 'flex', 
    gap: '0.5rem', 
    marginBottom: '2rem', 
    borderBottom: '2px solid #e5e7eb', 
    paddingBottom: '0',
    justifyContent: 'center',
  },
  tab: {
    padding: '0.75rem 1.5rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    fontWeight: 600,
    fontSize: '1rem',
    borderBottom: '3px solid transparent',
    marginBottom: '-2px',
    transition: 'all 0.2s',
  },
  tabActive: { 
    color: '#667eea', 
    borderBottomColor: '#667eea' 
  },
  tabContent: { 
    paddingTop: '1rem' 
  },
  card: {
    background: '#fff',
    borderRadius: '12px',
    border: '1px solid #e5e7eb',
    padding: '2rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
  },
  field: { 
    marginBottom: '1.5rem' 
  },
  label: { 
    display: 'block', 
    marginBottom: '0.5rem', 
    fontWeight: 600, 
    color: '#374151',
    fontSize: '0.95rem',
  },
  input: {
    width: '100%',
    padding: '0.75rem 1rem',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    boxSizing: 'border-box',
    background: '#f9fafb',
    transition: 'border-color 0.2s, background 0.2s',
  },
  fieldError: { 
    color: '#dc2626', 
    fontSize: '0.85rem', 
    marginTop: '0.5rem', 
    display: 'block',
    fontWeight: 500,
  },
  success: {
    background: '#d1fae5',
    border: '1px solid #6ee7b7',
    color: '#065f46',
    padding: '0.75rem 1rem',
    borderRadius: '8px',
    marginBottom: '1.5rem',
    fontWeight: 500,
  },
  button: {
    padding: '0.75rem 1.5rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 2px 8px rgba(102, 126, 234, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
    width: '100%',
  },
};
