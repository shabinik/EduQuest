import { useEffect, useState } from "react"
import axiosInstance from "../../api/axiosInstance"

const DAYS = [
  { key: "mon", label: "Monday" },
  { key: "tue", label: "Tuesday" },
  { key: "wed", label: "Wednesday" },
  { key: "thu", label: "Thursday" },
  { key: "fri", label: "Friday" },
  { key: "sat", label: "Saturday" },
]

export default function StudentTimeTable() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance
      .get("classroom/students/timetable/")
      .then(res => setData(res.data))
      .catch(() => setData(null))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-6 text-gray-500">Loading timetable...</div>
  }

  if (!data) {
    return <div className="p-6 text-red-500">No timetable available</div>
  }

  // ✅ SAFE defaults
  const {
    class_name,
    division,
    matrix = {},
    slots = [],
  } = data

  if (!slots.length) {
    return (
      <div className="p-6 text-gray-500">
        Timetable slots not configured yet.
      </div>
    )
  }

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-black mb-2">
        🗓️ Timetable – {class_name} {division && `(${division})`}
      </h1>

      <div className="overflow-x-auto mt-6 bg-white rounded-xl border shadow-sm">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-gray-50">
              <th className="p-4 text-xs font-bold uppercase text-gray-500">
                Day / Time
              </th>

              {slots.map(slot => (
                <th
                  key={slot.id}
                  className="p-4 text-xs font-bold text-center text-indigo-600"
                >
                  {slot.start_time.slice(0, 5)} - {slot.end_time.slice(0, 5)}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {DAYS.map(day => (
              <tr key={day.key}>
                <td className="p-4 font-bold text-indigo-600 bg-indigo-50">
                  {day.label}
                </td>

                {slots.map(slot => {
                  const cell = matrix?.[day.key]?.[slot.id]

                  return (
                    <td key={slot.id} className="p-3 border text-center">
                      {slot.is_break ? (
                        <span className="text-amber-600 font-bold text-xs uppercase tracking-wider">
                          Break
                        </span>
                      ) : cell ? (
                        <>
                          <div className="font-bold text-gray-900">
                            {cell.subject}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {cell.teacher}
                          </div>
                        </>
                      ) : (
                        <span className="text-gray-300">—</span>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}
