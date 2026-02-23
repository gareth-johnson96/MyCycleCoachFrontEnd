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
      <h1 style={styles.heading}>My Profile</h1>
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
            {tab === 'profile' ? 'Profile Info' : tab === 'background' ? 'Training Background' : 'Goals'}
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
        Save Profile
      </button>
    </form>
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
        Save Background
      </button>
    </form>
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
        Save Goals
      </button>
    </form>
  );
}

const styles: Record<string, React.CSSProperties> = {
  page: { maxWidth: '600px', margin: '0 auto', padding: '1.5rem' },
  heading: { marginBottom: '1.5rem', color: '#111827' },
  tabs: { display: 'flex', gap: '0.5rem', marginBottom: '1.5rem', borderBottom: '2px solid #e5e7eb', paddingBottom: '0' },
  tab: {
    padding: '0.5rem 1rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer',
    color: '#6b7280',
    fontWeight: 500,
    borderBottom: '2px solid transparent',
    marginBottom: '-2px',
  },
  tabActive: { color: '#1a56db', borderBottomColor: '#1a56db' },
  tabContent: { paddingTop: '1rem' },
  field: { marginBottom: '1rem' },
  label: { display: 'block', marginBottom: '0.25rem', fontWeight: 500, color: '#374151' },
  input: {
    width: '100%',
    padding: '0.5rem 0.75rem',
    border: '1px solid #d1d5db',
    borderRadius: '4px',
    fontSize: '1rem',
    boxSizing: 'border-box',
  },
  fieldError: { color: '#dc2626', fontSize: '0.8rem', marginTop: '0.25rem', display: 'block' },
  success: {
    background: '#f0fdf4',
    border: '1px solid #bbf7d0',
    color: '#15803d',
    padding: '0.75rem',
    borderRadius: '4px',
    marginBottom: '1rem',
  },
  button: {
    padding: '0.65rem 1.5rem',
    background: '#1a56db',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    cursor: 'pointer',
  },
};
