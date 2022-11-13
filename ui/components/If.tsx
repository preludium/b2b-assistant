import type { FC, ReactNode } from 'react';

import { CommonProps } from '@/types/common';

interface Props extends CommonProps {
    condition: boolean | undefined;
    else?: ReactNode;
}

const If: FC<Props> = (props) => props.condition
    ? <>{props.children}</>
    : <>{props.else}</>;

export default If;
