import { useState, useEffect } from 'react';

export function deviceType(breakpoint = 768) {
    const [device, setDevice] = useState('');

    useEffect(() => {
        function checkWidth() {
            if (typeof window !== "undefined") {
                if (window.innerWidth < breakpoint) {
                    setDevice('Mobile');
                } else {
                    setDevice('Desktop');
                }
            } else {
                setDevice('Desktop');
            }

        }

        checkWidth();
        window.addEventListener('resize', checkWidth);
        return () => window.removeEventListener('resize', checkWidth);
    }, [breakpoint]);

    return device;
}
