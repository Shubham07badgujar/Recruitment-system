from typing import Dict, Any, List, Optional
from datetime import datetime, timedelta
import pytz

class SchedulerAgent:
    """Agent for scheduling interviews"""
    
    def __init__(self):
        # Default business hours and interview duration
        self.business_hours = {
            'start_hour': 9,  # 9 AM
            'end_hour': 17,   # 5 PM
            'days': [0, 1, 2, 3, 4]  # Monday to Friday (0 = Monday in Python's datetime)
        }
        self.default_duration = 60  # minutes
        self.default_timezone = pytz.timezone('America/New_York')  # Default timezone
    
    def get_slots(self, existing_slots: List[Dict[str, Any]], preferences: Optional[Dict[str, Any]] = None) -> Dict[str, Any]:
        """
        Get available interview slots
        
        Args:
            existing_slots: List of existing scheduled interviews
            preferences: Scheduling preferences (optional)
            
        Returns:
            Dictionary with available slots
        """
        # Parse preferences
        business_hours = self._parse_business_hours(preferences)
        timezone = self._parse_timezone(preferences)
        duration = self._parse_duration(preferences)
        num_slots = self._parse_num_slots(preferences)
        
        # Parse existing slots
        busy_slots = self._parse_existing_slots(existing_slots)
        
        # Get current date and time in the specified timezone
        current_time = datetime.now(timezone)
        
        # Start from the next business day
        start_date = current_time + timedelta(days=1)
        if start_date.weekday() not in business_hours['days']:
            days_to_add = 1
            while (start_date + timedelta(days=days_to_add)).weekday() not in business_hours['days']:
                days_to_add += 1
            start_date = start_date + timedelta(days=days_to_add)
        
        # Generate available slots for the next 10 business days
        available_slots = []
        current_date = start_date.replace(hour=business_hours['start_hour'], minute=0, second=0, microsecond=0)
        days_checked = 0
        days_limit = 10
        
        while days_checked < days_limit and len(available_slots) < num_slots:
            # Check if current date is a business day
            if current_date.weekday() in business_hours['days']:
                # Generate slots for this day
                day_slots = self._generate_day_slots(current_date, business_hours, duration, busy_slots)
                available_slots.extend(day_slots)
                
                if len(available_slots) >= num_slots:
                    available_slots = available_slots[:num_slots]
                    break
            
            # Move to next day
            current_date = current_date + timedelta(days=1)
            current_date = current_date.replace(hour=business_hours['start_hour'], minute=0, second=0, microsecond=0)
            days_checked += 1
        
        # Format slots
        formatted_slots = [
            {
                "startTime": slot.strftime("%Y-%m-%dT%H:%M:%S%z"),
                "endTime": (slot + timedelta(minutes=duration)).strftime("%Y-%m-%dT%H:%M:%S%z"),
                "duration": duration
            }
            for slot in available_slots
        ]
        
        return {
            "availableSlots": formatted_slots,
            "timezone": str(timezone)
        }
    
    def _parse_business_hours(self, preferences: Optional[Dict[str, Any]]) -> Dict[str, Any]:
        """Parse business hours from preferences"""
        if not preferences or 'businessHours' not in preferences:
            return self.business_hours
        
        business_hours = preferences.get('businessHours', {})
        return {
            'start_hour': business_hours.get('startHour', self.business_hours['start_hour']),
            'end_hour': business_hours.get('endHour', self.business_hours['end_hour']),
            'days': business_hours.get('days', self.business_hours['days'])
        }
    
    def _parse_timezone(self, preferences: Optional[Dict[str, Any]]) -> pytz.timezone:
        """Parse timezone from preferences"""
        if not preferences or 'timezone' not in preferences:
            return self.default_timezone
        
        timezone_str = preferences.get('timezone')
        try:
            return pytz.timezone(timezone_str)
        except:
            return self.default_timezone
    
    def _parse_duration(self, preferences: Optional[Dict[str, Any]]) -> int:
        """Parse interview duration from preferences"""
        if not preferences or 'duration' not in preferences:
            return self.default_duration
        
        duration = preferences.get('duration')
        if isinstance(duration, int) and duration > 0:
            return duration
        return self.default_duration
    
    def _parse_num_slots(self, preferences: Optional[Dict[str, Any]]) -> int:
        """Parse number of slots to return from preferences"""
        if not preferences or 'numSlots' not in preferences:
            return 10  # Default to 10 slots
        
        num_slots = preferences.get('numSlots')
        if isinstance(num_slots, int) and num_slots > 0:
            return num_slots
        return 10
    
    def _parse_existing_slots(self, existing_slots: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Parse existing slots into a standardized format"""
        busy_times = []
        
        for slot in existing_slots:
            try:
                if 'scheduledDate' in slot:
                    # Parse date string
                    start_time = self._parse_datetime(slot['scheduledDate'])
                    
                    # Get duration
                    duration = slot.get('duration', self.default_duration)
                    
                    # Calculate end time
                    end_time = start_time + timedelta(minutes=duration)
                    
                    busy_times.append({
                        'start': start_time,
                        'end': end_time
                    })
            except:
                continue
        
        return busy_times
    
    def _parse_datetime(self, date_str: str) -> datetime:
        """Parse datetime string to datetime object"""
        try:
            # Try ISO format first
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            return dt
        except:
            try:
                # Try with timezone info
                dt = datetime.strptime(date_str, "%Y-%m-%dT%H:%M:%S%z")
                return dt
            except:
                try:
                    # Try without timezone
                    dt = datetime.strptime(date_str, "%Y-%m-%d %H:%M:%S")
                    return dt.replace(tzinfo=pytz.UTC)
                except:
                    # Last resort, just use current time
                    return datetime.now(pytz.UTC)
    
    def _generate_day_slots(self, start_date: datetime, business_hours: Dict[str, Any], 
                           duration: int, busy_slots: List[Dict[str, Any]]) -> List[datetime]:
        """Generate available slots for a day"""
        available_slots = []
        
        # Start from business hours start
        current_slot = start_date.replace(hour=business_hours['start_hour'], minute=0, second=0, microsecond=0)
        
        # End at business hours end
        end_time = start_date.replace(hour=business_hours['end_hour'], minute=0, second=0, microsecond=0)
        
        # Generate slots with specified duration
        while current_slot + timedelta(minutes=duration) <= end_time:
            # Check if slot conflicts with any busy slot
            is_available = True
            
            for busy in busy_slots:
                # Check if there's an overlap
                if (current_slot < busy['end'] and 
                    current_slot + timedelta(minutes=duration) > busy['start']):
                    is_available = False
                    break
            
            if is_available:
                available_slots.append(current_slot)
            
            # Move to next slot
            current_slot = current_slot + timedelta(minutes=30)  # 30-minute increments
        
        return available_slots
