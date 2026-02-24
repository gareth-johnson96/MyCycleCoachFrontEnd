import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import { submitQuestionnaire } from './questionnaireApi';
import type { QuestionnaireRequest } from './questionnaireApi';
import ErrorMessage from '../../components/ErrorMessage';

export default function QuestionnairePage() {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
    trigger,
  } = useForm<QuestionnaireRequest>();

  async function handleNext() {
    const isValid = await trigger();
    if (isValid && step < 3) {
      setStep(step + 1);
    }
  }

  function handlePrevious() {
    if (step > 1) {
      setStep(step - 1);
    }
  }

  async function onSubmit(data: QuestionnaireRequest) {
    setServerError(null);
    try {
      await submitQuestionnaire(data);
      navigate('/training');
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string } } };
      setServerError(
        axiosErr.response?.data?.message ?? 'Failed to submit questionnaire. Please try again.'
      );
    }
  }

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.header}>
          <h1 style={styles.title}>🚴 Welcome to MyCycleCoach!</h1>
          <p style={styles.subtitle}>
            Let's personalize your training plan - Step {step} of 3
          </p>
          <div style={styles.progressBar}>
            <div style={{ ...styles.progressFill, width: `${(step / 3) * 100}%` }} />
          </div>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          {/* Step 1: Profile Information */}
          {step === 1 && (
            <div>
              <h2 style={styles.stepTitle}>📋 Your Profile</h2>
              
              <div style={styles.field}>
                <label style={styles.label}>Age</label>
                <input
                  style={styles.input}
                  type="number"
                  {...register('age', {
                    min: { value: 1, message: 'Age must be at least 1' },
                    max: { value: 150, message: 'Age must be less than 150' },
                    valueAsNumber: true,
                  })}
                />
                {errors.age && <span style={styles.error}>{errors.age.message}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Weight (kg)</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.1"
                  {...register('weight', {
                    min: { value: 1, message: 'Weight must be at least 1' },
                    max: { value: 500, message: 'Weight must be less than 500' },
                    valueAsNumber: true,
                  })}
                />
                {errors.weight && <span style={styles.error}>{errors.weight.message}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Height (cm)</label>
                <input
                  style={styles.input}
                  type="number"
                  step="0.1"
                  {...register('height', {
                    min: { value: 50, message: 'Height must be at least 50' },
                    max: { value: 300, message: 'Height must be less than 300' },
                    valueAsNumber: true,
                  })}
                />
                {errors.height && <span style={styles.error}>{errors.height.message}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Experience Level</label>
                <select style={styles.input} {...register('experienceLevel')}>
                  <option value="">Select level...</option>
                  <option value="BEGINNER">Beginner</option>
                  <option value="INTERMEDIATE">Intermediate</option>
                  <option value="ADVANCED">Advanced</option>
                  <option value="PROFESSIONAL">Professional</option>
                </select>
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Current FTP (Functional Threshold Power) - Optional</label>
                <input
                  style={styles.input}
                  type="number"
                  {...register('currentFtp', {
                    min: { value: 0, message: 'FTP must be at least 0' },
                    max: { value: 600, message: 'FTP must be less than 600' },
                    valueAsNumber: true,
                  })}
                />
                {errors.currentFtp && <span style={styles.error}>{errors.currentFtp.message}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Maximum Heart Rate - Optional</label>
                <input
                  style={styles.input}
                  type="number"
                  {...register('maxHr', {
                    min: { value: 50, message: 'Max HR must be at least 50' },
                    max: { value: 250, message: 'Max HR must be less than 250' },
                    valueAsNumber: true,
                  })}
                />
                {errors.maxHr && <span style={styles.error}>{errors.maxHr.message}</span>}
              </div>
            </div>
          )}

          {/* Step 2: Training Background */}
          {step === 2 && (
            <div>
              <h2 style={styles.stepTitle}>🏋️ Training Background</h2>

              <div style={styles.field}>
                <label style={styles.label}>Years of Training - Optional</label>
                <input
                  style={styles.input}
                  type="number"
                  {...register('yearsTraining', { valueAsNumber: true })}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Weekly Training Volume (hours) - Optional</label>
                <input
                  style={styles.input}
                  type="number"
                  {...register('weeklyVolume', { valueAsNumber: true })}
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Training History - Optional</label>
                <textarea
                  style={{ ...styles.input, minHeight: '80px' }}
                  {...register('trainingHistory')}
                  placeholder="Describe your training background..."
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Injury History - Optional</label>
                <textarea
                  style={{ ...styles.input, minHeight: '80px' }}
                  {...register('injuryHistory')}
                  placeholder="Any past injuries we should be aware of..."
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Recent Injuries - Optional</label>
                <textarea
                  style={{ ...styles.input, minHeight: '80px' }}
                  {...register('recentInjuries')}
                  placeholder="Any current or recent injuries..."
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Prior Events - Optional</label>
                <textarea
                  style={{ ...styles.input, minHeight: '80px' }}
                  {...register('priorEvents')}
                  placeholder="List any cycling events you've participated in..."
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Daily Availability - Optional</label>
                <input
                  style={styles.input}
                  type="text"
                  {...register('dailyAvailability')}
                  placeholder="e.g., Morning before work, Evenings, Weekends"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Weekly Training Times - Optional</label>
                <input
                  style={styles.input}
                  type="text"
                  {...register('weeklyTrainingTimes')}
                  placeholder="e.g., Mon/Wed/Fri evenings, Sat/Sun mornings"
                />
              </div>
            </div>
          )}

          {/* Step 3: Goals */}
          {step === 3 && (
            <div>
              <h2 style={styles.stepTitle}>🎯 Your Goals</h2>

              <div style={styles.field}>
                <label style={styles.label}>Training Goals *</label>
                <textarea
                  style={{ ...styles.input, minHeight: '120px' }}
                  {...register('goals', { required: 'Goals are required' })}
                  placeholder="What do you want to achieve? (e.g., Complete a century ride, improve fitness, race preparation...)"
                />
                {errors.goals && <span style={styles.error}>{errors.goals.message}</span>}
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Target Event - Optional</label>
                <input
                  style={styles.input}
                  type="text"
                  {...register('targetEvent')}
                  placeholder="e.g., Tour de France Sportive, Local Gran Fondo"
                />
              </div>

              <div style={styles.field}>
                <label style={styles.label}>Target Event Date - Optional</label>
                <input
                  style={styles.input}
                  type="date"
                  {...register('targetEventDate')}
                />
              </div>
            </div>
          )}

          {serverError && <ErrorMessage message={serverError} />}

          {/* Navigation Buttons */}
          <div style={styles.buttonRow}>
            {step > 1 && (
              <button
                type="button"
                style={styles.backButton}
                onClick={handlePrevious}
              >
                ← Back
              </button>
            )}
            {step < 3 ? (
              <button
                type="button"
                style={styles.nextButton}
                onClick={handleNext}
              >
                Next →
              </button>
            ) : (
              <button
                type="submit"
                style={styles.submitButton}
                disabled={isSubmitting}
              >
                {isSubmitting ? '⏳ Submitting...' : '✨ Complete Setup'}
              </button>
            )}
          </div>

          {step === 1 && (
            <div style={styles.skipContainer}>
              <button
                type="button"
                style={styles.skipButton}
                onClick={() => navigate('/training')}
              >
                Skip for now
              </button>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

const styles: Record<string, React.CSSProperties> = {
  container: {
    minHeight: '100vh',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    padding: '1rem',
  },
  card: {
    background: '#fff',
    padding: '2.5rem',
    borderRadius: '12px',
    boxShadow: '0 10px 40px rgba(0,0,0,0.2)',
    width: '100%',
    maxWidth: '650px',
    maxHeight: '90vh',
    overflowY: 'auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '2rem',
  },
  title: {
    margin: '0 0 0.5rem',
    color: '#111827',
    fontSize: '2rem',
    fontWeight: 700,
  },
  subtitle: {
    margin: '0 0 1rem',
    fontSize: '1rem',
    color: '#6b7280',
  },
  progressBar: {
    height: '8px',
    background: '#e5e7eb',
    borderRadius: '4px',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    transition: 'width 0.3s ease',
  },
  stepTitle: {
    margin: '0 0 1.5rem',
    color: '#111827',
    fontSize: '1.5rem',
    fontWeight: 600,
  },
  field: {
    marginBottom: '1.5rem',
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
  error: {
    color: '#dc2626',
    fontSize: '0.85rem',
    marginTop: '0.5rem',
    display: 'block',
    fontWeight: 500,
  },
  buttonRow: {
    display: 'flex',
    gap: '1rem',
    marginTop: '2rem',
  },
  backButton: {
    flex: 1,
    padding: '0.75rem',
    background: '#f3f4f6',
    color: '#374151',
    border: '2px solid #e5e7eb',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s',
  },
  nextButton: {
    flex: 1,
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(102, 126, 234, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  submitButton: {
    flex: 1,
    padding: '0.75rem',
    background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
    color: '#fff',
    border: 'none',
    borderRadius: '8px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.3)',
    transition: 'transform 0.2s, box-shadow 0.2s',
  },
  skipContainer: {
    textAlign: 'center',
    marginTop: '1rem',
  },
  skipButton: {
    background: 'none',
    border: 'none',
    color: '#6b7280',
    fontSize: '0.95rem',
    cursor: 'pointer',
    textDecoration: 'underline',
  },
};
