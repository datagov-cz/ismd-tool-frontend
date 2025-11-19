import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';

import { authOptions } from '@/lib/auth';

import { CreateForm } from './create-form';

const CreateDictionary = async () => {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect('/');
  }

  return (
    <div className="w-full">
      <CreateForm />
    </div>
  );
};

export default CreateDictionary;
