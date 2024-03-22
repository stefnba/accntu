'use client';

import {
    LuLayoutDashboard,
    LuUser,
    LuDownload,
    LuBookmark
} from 'react-icons/lu';

const routes = [
    {
        icon: LuLayoutDashboard,
        label: 'Home',
        href: '/'
    },
    {
        icon: LuBookmark,
        label: 'Bookmarks',
        href: '/bookmark'
    },
    {
        icon: LuDownload,
        label: 'Downloads',
        href: '/download'
    }
];

export default routes;
