import { CircleAlert } from 'lucide-react'

export function EmptyState({ title, message }: { title: string; message: string }) {
  return <div className="empty-state"><CircleAlert size={22} /><strong>{title}</strong><span>{message}</span></div>
}
