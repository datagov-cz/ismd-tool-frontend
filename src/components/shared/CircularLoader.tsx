import { GovIcon } from '@gov-design-system-ce/react';

export const CircularLoader = () => (
  <div className="col-span-1 md:col-span-2 flex justify-center items-center py-12">
    <GovIcon
      type="components"
      color="primary"
      name="loader"
      size="5xl"
      className="animate-spin"
    />
  </div>
);
