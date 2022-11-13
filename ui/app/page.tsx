'use client';
import { downloadB2BFiles } from './Home.utils';


const Home = () => (
    <div>
        <button onClick={() => downloadB2BFiles({
            invoiceNumber: '04/2022',
            rate: 80,
            workedHours: 150
        })}>
                Download
        </button>
    </div>
);
    
export default Home;
