'use client';
import { useTranslation } from '@wac/app/i18n/client';
import Image from 'next/image';
import Logowc from'../../../../public/images/logoLarge.svg';

interface PropsType {
  lng: string;
}

const Footer = ({ lng }: PropsType) => {
  const { t } = useTranslation(lng, 'common');

  return (
    <footer className="bg-light rounded-lg shadow mt-16 ">
        <div className="w-full max-w-screen-xl mx-auto p-4 md:py-8">
            <div className="sm:flex sm:items-center sm:justify-between">
                <a href="/" className="flex items-center mb-4 sm:mb-0">
                    <Image
                    className='hover:scale-125 mr-3'
                    src={Logowc}
                    // layout="fill"
                    width={250}
                    priority={true}
                    alt="Wish and Cook"
                    />
                </a>
                <ul className="flex flex-wrap items-center mb-6 text-sm font-medium text-gray-500 sm:mb-0">
                    <li>
                        <a href="#" className="mr-4 hover:underline md:mr-6 ">About</a>
                    </li>
                    <li>
                        <a href="#" className="mr-4 hover:underline md:mr-6">Privacy Policy</a>
                    </li>
                    <li>
                        <a href="#" className="mr-4 hover:underline md:mr-6 ">Licensing</a>
                    </li>
                    <li>
                        <a href="#" className="hover:underline">Contact</a>
                    </li>
                </ul>
            </div>
            <hr className="my-6 border-gray-200 sm:mx-auto  lg:my-8" />
            <span className="block text-sm text-gray-500 sm:text-center ">© 2023 <a href="/" className="hover:underline">WishandCook™</a>. All Rights Reserved.</span>
        </div>
    </footer>
  );
};

export default Footer;
