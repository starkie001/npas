"use client";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

// Helper to convert Date to yyyy-mm-dd
function formatDate(date) {
	return date.toISOString().split("T")[0];
}

export default function ObsAvailabilityPage() {
	const router = useRouter();
	const { data: session, status } = useSession();
	const [openDates, setOpenDates] = useState([]); // Array of yyyy-mm-dd strings
	const [loading, setLoading] = useState(true);
	const [saving, setSaving] = useState(false);
	const [error, setError] = useState(null);

	// Access control: Only admin can access
	useEffect(() => {
		if (status === "loading") return;
		if (!session) {
			router.replace("/auth/signin");
			return;
		}
		if (session.user?.role !== "admin") {
			router.replace("/access-denied");
			return;
		}
	}, [session, status, router]);

	// Fetch existing open dates from backend
	useEffect(() => {
		async function fetchAvailability() {
			setLoading(true);
			try {
				const res = await fetch("/api/obs-availability");
				if (!res.ok) throw new Error("Failed to fetch availability");
				const data = await res.json();
				setOpenDates(data.openDates || []);
			} catch (err) {
				setError(err.message);
			} finally {
				setLoading(false);
			}
		}
		fetchAvailability();
	}, []);

	function handleDateClick(date) {
		const d = formatDate(date);
		setOpenDates((prev) =>
			prev.includes(d)
				? prev.filter((x) => x !== d)
				: [...prev, d]
		);
	}

	function tileClassName({ date, view }) {
		if (view === "month") {
			return openDates.includes(formatDate(date))
				? "open-date"
				: "closed-date";
		}
	}

	async function handleSave() {
		setSaving(true);
		setError(null);
		// Validation: At least one date must be open
		if (openDates.length === 0) {
			setError("Please select at least one open date.");
			setSaving(false);
			return;
		}
		try {
			const res = await fetch("/api/obs-availability", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({ openDates }),
			});
			if (!res.ok) throw new Error("Failed to save availability");
			alert("Availability saved!");
			// Optionally, refresh or redirect
			// router.refresh();
		} catch (err) {
			setError(err.message);
		} finally {
			setSaving(false);
		}
	}

	return (
		<div className="container mt-5">
			<h2>Observatory Availability</h2>
			<p>Select nights the observatory can be open for bookings. Grey = closed, Green = open.</p>
			{error && <div className="alert alert-danger">{error}</div>}
			{loading ? (
				<div>Loading...</div>
			) : (
				<>
					<Calendar
						onClickDay={handleDateClick}
						tileClassName={tileClassName}
					/>
					<button className="btn btn-primary mt-3" onClick={handleSave} disabled={saving}>
						{saving ? "Saving..." : "Save"}
					</button>
				</>
			)}
			<style jsx>{`
				.closed-date {
					background: #ccc !important;
				}
				.open-date {
					background: #4caf50 !important;
					color: white !important;
				}
			`}</style>
		</div>
	);
}
