import Image from 'next/image';
import React from 'react';

export const Logo = () => {
  return (
    <Image
      src='/logo.svg'
      alt='ShowStakr Logo'
      width={50}
      height={50}
      className='w-full h-full object-contain'
    />
  );
};
