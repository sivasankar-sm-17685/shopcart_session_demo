// Types
import type { AuthFormProps } from '../../types/auth';

// Components
import FormField from '../../components/FormField';

export default function AuthForm(props: AuthFormProps) {
  const {
    username,
    onSubmit,
    onUsernameChange,
    password,
    onPasswordChange,
    error,
    isSubmitting
  } = props;

  return (
    <form className='auth-form' onSubmit={onSubmit}>
      <FormField
        label='Username'
        value={username}
        onChange={onUsernameChange}
        placeholder='Enter your username'
      />
      <FormField
        label='Password'
        type='password'
        value={password}
        onChange={onPasswordChange}
        placeholder='Enter your password'
      />
      <button className='auth-submit' type='submit' disabled={isSubmitting}>
        {isSubmitting ? 'Submitting...' : 'Submit'}
      </button>
      {error && <p className='auth-error'>{error}</p>}
    </form>
  );
}
