const steps = ["Placed", "Confirmed", "Processing", "Packed", "Shipped", "Out for delivery", "Delivered"];

function OrderTimeline({ status }) {
  const terminal = ["Cancelled", "Return requested", "Refunded"].includes(status);
  const activeIndex = status === "Delivered" ? 6 : status === "Shipped" ? 4 : status === "Processing" ? 2 : 1;
  return (
    <ol className={`order-timeline${terminal ? " timeline-terminal" : ""}`}>
      {(terminal ? ["Placed", status] : steps).map((step, index) => (
        <li className={index <= activeIndex ? "timeline-complete" : ""} key={step}>
          <span className="timeline-dot" /><span>{step}</span>
        </li>
      ))}
    </ol>
  );
}

export default OrderTimeline;
