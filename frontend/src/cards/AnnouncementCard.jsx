export default function AnnouncementCard({ a }) {
  const expiry = new Date(a.expiry_date);

  return (
    <div className="bg-white rounded-lg shadow p-4 mb-4 border-l-4 border-indigo-500">
      <h4 className="font-bold text-lg text-gray-800">
        {a.title}
      </h4>

      <p className="text-gray-600 mt-1">
        {a.description}
      </p>

      <p className="text-xs text-gray-400 mt-3">
        ⏰ Expires: {expiry.toLocaleString()}
      </p>
    </div>
  );
}
