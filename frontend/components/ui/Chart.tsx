import { Line } from "react-chartjs-2";
import PropTypes from "prop-types";

const Chart = ({ data, options }) => {
  return (
    <Line data={data} options={options} aria-label="Chart displaying data" />
  );
};

Chart.propTypes = {
  data: PropTypes.object.isRequired,
  options: PropTypes.object,
};

export default Chart;
