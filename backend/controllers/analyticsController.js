import Analytics from "../models/Analytics.js";

function updateDaily(daily, date, time, accuracy) {
  const idx = daily.findIndex(d => d.date === date);

  if (idx === -1) {
    daily.push({ date, count: 1, time, accuracy });
  } else {
    daily[idx].count += 1;
    daily[idx].time += time;
    daily[idx].accuracy += accuracy;
  }

  return daily;
}

export const trackAnalytics = async (req, res) => {
  try {
    const { featureName, timeSpent = 0, accuracy = 0 } = req.body;
    if (!featureName) return res.status(400).json({ message: "featureName required" });

    const date = new Date().toLocaleDateString("en-IN");
    let doc = await Analytics.findOne({ featureName });

    if (!doc) {
      doc = await Analytics.create({
        featureName,
        usedCount: 1,
        totalTimeSpent: timeSpent,
        accuracySum: accuracy,
        accuracyCount: accuracy > 0 ? 1 : 0,
        daily: [{ date, count: 1, time: timeSpent, accuracy }]
      });
    } else {
      doc.usedCount++;
      doc.totalTimeSpent += timeSpent;

      if (accuracy > 0) {
        doc.accuracySum += accuracy;
        doc.accuracyCount++;
      }

      doc.daily = updateDaily(doc.daily, date, timeSpent, accuracy);
      await doc.save();
    }

    res.json({ message: "Analytics tracked" });

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getAnalytics = async (req, res) => {
  try {
    const docs = await Analytics.find({});
    const formatted = docs.map(d => ({
      featureName: d.featureName,
      usedCount: d.usedCount,
      totalTimeSpent: d.totalTimeSpent,
      avgAccuracy: d.accuracyCount > 0 ? (d.accuracySum / d.accuracyCount).toFixed(1) : 0,
      daily: d.daily
    }));
    res.json(formatted);

  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
