import { OntologyList } from '@/components/onotologyList/OntologyList';

const NKDList = async () => {
  return (
    <div className="w-full bg-primary-subtlest">
      <OntologyList type="NKD" />
    </div>
  );
};

export default NKDList;
