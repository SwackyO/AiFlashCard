export default function Card({ className = '', children }) {
    return <div className={['card', className].join(' ')}>{children}</div>;
}