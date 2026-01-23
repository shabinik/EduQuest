import { useEffect, useState } from "react"
import axiosInstance from "../../api/axiosInstance"

const DAYS = {
  mon: "Monday",
  tue: "Tuesday",
  wed: "Wednesday",
  thu: "Thursday",
  fri: "Friday",
  sat: "Saturday",
}

export default function TeacherTimeTable() {
  const [data, setData] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    axiosInstance
      .get("classroom/teachers/timetable/")
      .then(res => setData(res.data))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <div className="p-6 text-gray-500">Loading timetable...</div>
  }

  if (!data || !Object.keys(data.timetable).length) {
    return <div className="p-6 text-gray-500">No timetable assigned yet.</div>
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <h1 className="text-3xl font-black mb-6">
        🗓️ My Teaching Schedule
      </h1>

      {Object.entries(data.timetable).map(([day, entries]) => (
        <div key={day} className="mb-8">
          <h2 className="text-lg font-bold text-indigo-600 mb-3">
            {DAYS[day]}
          </h2>

          <div className="bg-white rounded-xl border shadow-sm divide-y">
            {entries.map((e, idx) => (
              <div
                key={idx}
                className="p-4 flex justify-between items-center"
              >
                <div>
                  <div className="font-bold text-gray-900">
                    {e.subject}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    Class {e.class_name}
                    {e.division && ` - ${e.division}`}
                  </div>
                </div>

                <div className="font-mono text-sm text-indigo-600">
                  {e.start_time.slice(0, 5)} - {e.end_time.slice(0, 5)}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  )
}
