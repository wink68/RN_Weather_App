import * as Location from "expo-location";
import { StatusBar } from "expo-status-bar";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  ImageBackground,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from "react-native";
import { Fontisto } from '@expo/vector-icons'; 

const API_KEY = "f106a472745a0b328406fea696f4bd2b";

const { width: SCREEN_WIDTH } = Dimensions.get("window"); // 모바일 width 길이 가져오기
const icons = {
  Clouds: "cloudy",
  Clear: "day-sunny",
  Atmosphere: "cloudy-gusts",
  Snow: "snow",
  Rain: "rains",
  Drizzle: "rain",
  Thunderstorm: "lightning",
};

export default function App() {
  const [city, setCity] = useState("Loading...");
  const [days, setDays] = useState([]);
  const [ok, setOk] = useState(true);
  const [currentPage, setCurrentPage] = useState(0);

  const getWeather = async () => {
    // 위치 정보
    const { granted } = await Location.requestForegroundPermissionsAsync();
    if (!granted) {
      setOk(false);
    }
    const {
      coords: { latitude, longitude },
    } = await Location.getCurrentPositionAsync({ accuracy: 5 });
    const location = await Location.reverseGeocodeAsync(
      { latitude, longitude },
      { useGoogleMaps: false }
    );
    if ((location[0].city == null) | undefined) {
      setCity("Seoul");
    } else {
      setCity(location[0].city);
    }

    // 날씨
    const response = await fetch(
      `https://api.openweathermap.org/data/2.5/forecast?lat=${latitude}&lon=${longitude}&appid=${API_KEY}&units=metric`
    );
    const json = await response.json();
    const filteredList = json.list.filter((weather) => {
      if (weather.dt_txt.includes("00:00:00")) {
        return weather;
      }
    });
    setDays(filteredList);
  };

  useEffect(() => {
    getWeather();
  }, []);

  const handleScroll = (event) => {
    const viewWidth = event.nativeEvent.layoutMeasurement.width;
    const contentOffsetX = event.nativeEvent.contentOffset.x;

    const currentPage = Math.floor(contentOffsetX / viewWidth);
    setCurrentPage(currentPage);
  };

  return (
    <ImageBackground
      source={require("./assets/star.jpg")}
      style={styles.container}
    >
      <StatusBar style="light" />
      <View style={styles.city}>
        <Text style={styles.cityName}>{city}</Text>
      </View>
      <ScrollView
        horizontal
        pagingEnabled // 페이지네이션 느낌
        showsHorizontalScrollIndicator={false} // 아래 스크롤 제거
        // contentContainerStyle={styles.weather}
        onScroll={handleScroll}
        scrollEventThrottle={16} // 이벤트 발생 주기
      >
        {days && days.length === 0 ? (
          <View style={{ ...styles.day, alignItems: "center" }}>
            <ActivityIndicator
              size="large"
              color="#fff"
              style={{ marginTop: 10 }}
            />
          </View>
        ) : (
          days.map((day, idx) => (
            <View key={idx} style={styles.day}>
              <Text style={styles.temp}>
                {parseFloat(day.main.temp).toFixed(1)}°
              </Text>
              <View style={styles.weather}>
                <Fontisto
                  name={icons[day.weather[0].main]}
                  size={35}
                  color="#fff"
                  style={styles.weatherIcon}
                />
                <Text style={styles.description}>{day.weather[0].main}</Text>
              </View>
              <Text style={styles.tinyText}>{day.weather[0].description}</Text>
            </View>
          ))
        )}
      </ScrollView>
      <View style={styles.pageIndicatorContainer}>
        {days.map((_, idx) => (
          <View
            key={idx}
            style={[
              styles.pageDot,
              currentPage === idx ? styles.activeDot : null
            ]}
          />
        ))}
      </View>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  city: {
    flex: 1.2,
    justifyContent: "center",
    alignItems: "center",
  },
  cityName: {
    fontSize: 48,
    fontWeight: "500",
    color: "#fff",
  },
  weather: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  weatherIcon: {
    marginTop: 5,
    marginRight: 10,
  },
  day: {
    width: SCREEN_WIDTH,
    alignItems: "center",
  },
  temp: {
    marginTop: 40,
    fontSize: 108,
  },
  description: {
    marginTop: -10,
    fontSize: 40,
    color: "#fff",
  },
  tinyText: {
    fontSize: 15,
    color: "#fff",
  },
  pageIndicatorContainer: {
    paddingVertical: 10,
    marginBottom: 30,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0,0,0,0.7)',  // 반투명한 어두운 배경
  },
  pageDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: '#333',  // 어두운 내부 색상
    marginHorizontal: 5,
    borderColor: '#ddd',
  },
  activeDot: {
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
  },
});