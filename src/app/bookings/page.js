"use client";
import { useSearchParams } from "next/navigation";

export default function BookingsPage() {
	const searchParams = useSearchParams();
	const showConfirmation = searchParams.get("saved") === "1";
	return (
		<div className="container mt-5">
			<h2>Current Bookings</h2>
			{showConfirmation && (
				<div className="alert alert-success">Hosting availability saved successfully!</div>
			)}
			<p>This page will show all current bookings. (Implement details here.)</p>
		</div>
	);
}
