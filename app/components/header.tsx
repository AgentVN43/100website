import React from 'react'
import { HomeOutlined, UserOutlined } from '@ant-design/icons';
import Link from 'next/link';

export default function Header() {
    return (
        <div className='fixed flex justify-center gap-4 bg-white w-full top-0 right-0 z-10'>
            <Link href={'/'} className='cursor-pointer py-3'>
                <HomeOutlined /> Trang chủ
            </Link>
            <Link href={'/projects'} className='cursor-pointer py-3'>
                <HomeOutlined /> Bài viết
            </Link>
        </div>
    )
}
