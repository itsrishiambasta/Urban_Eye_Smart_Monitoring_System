from .vehicle_detection import VehicleDetectionModel
from .crowd_detection import CrowdDetectionModel
from .pollution_prediction import AirPollutionModel
import time

class AnalyticsEngine:
    """
    Central engine that aggregates data from all AI models to generate city-wide insights.
    """
    def __init__(self):
        self.vehicle_model = VehicleDetectionModel()
        self.crowd_model = CrowdDetectionModel()
        self.pollution_model = AirPollutionModel()
        
    def generate_city_insights(self, location="New Delhi, India"):
        """
        Runs all models for a specific location and combines them into actionable insights.
        """
        traffic_data = self.vehicle_model.analyze_frame(location)
        crowd_data = self.crowd_model.analyze_frame(location)
        # Default features for the analytics engine baseline since it's just polling 
        default_features = {
            'PM2.5': 45.0, 'PM10': 90.0, 'NO': 15.0, 'NO2': 30.0, 'NOx': 40.0, 
            'NH3': 20.0, 'CO': 1.0, 'SO2': 10.0, 'O3': 30.0, 'Benzene': 2.0, 
            'Toluene': 5.0, 'Xylene': 1.0
        }
        pollution_data = self.pollution_model.predict_aqi(default_features)
        
        
        # Calculate Machine Learning Correlation Insight
        # Base correlation factor (simulated based on typical urban environments where traffic causes 30-50% of PM2.5/NOx)
        base_correlation = 0.45 
        
        # Dynamically adjust correlation based on how heavy the traffic actually is right now
        # If there are 100 vehicles, correlation is higher than if there are 10
        total_v = traffic_data.get('counts', {}).get('total', 0)
        dynamic_correlation = min(0.85, base_correlation + (total_v * 0.005))
        
        # Calculate how much AQI would drop if traffic was reduced by 25%
        aqi_reduction_potential = int(pollution_data.get('current_aqi', 0) * dynamic_correlation * 0.25)
        
        insights = {
            "traffic_congestion_zones": [],
            "pollution_trends": "Stable",
            "crowd_density_alerts": [],
            "overall_status": "Normal",
            "traffic_pollution_correlation": {
                "coefficient": round(dynamic_correlation, 2),
                "insight_text": f"Traffic contributes to approx {int(dynamic_correlation * 100)}% of local pollution.",
                "reduction_potential": aqi_reduction_potential,
                "action": "Reduce local traffic by 25% to drop AQI significantly."
            }
        }
        
        # Generate basic insights
        if traffic_data['density'] == "High" or traffic_data.get('predicted_density_1h') == "Severe":
            insights['traffic_congestion_zones'].append("Downtown Sector A (Current/Predicted)")
            
        if crowd_data['alert_triggered']:
            insights['crowd_density_alerts'].append("Central Square (High Density)")
            
        if "predicted_aqi_tomorrow" in pollution_data:
            if pollution_data['predicted_aqi_tomorrow'] > pollution_data['current_aqi'] + 20:
                insights['pollution_trends'] = "Rising"
            elif pollution_data['predicted_aqi_tomorrow'] < pollution_data['current_aqi'] - 20:
                insights['pollution_trends'] = "Improving"
        else:
             insights['pollution_trends'] = "Live Only"
            
        if traffic_data['density'] == "High" and pollution_data.get('level') in ["Unhealthy", "Very Unhealthy", "Hazardous"]:
            insights['overall_status'] = "Critical Alert: High Traffic & Pollution"
            
        return {
            "timestamp": time.time(),
            "raw_data": {
                "traffic": traffic_data,
                "crowd": crowd_data,
                "pollution": pollution_data
            },
            "insights": insights
        }
