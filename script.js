(() => {
  const $ = (id) => document.getElementById(id);
  const clawTrack = $("claw-track");
  const claw = $("claw");
  const cable = $("claw-cable");
  const gifts = [...document.querySelectorAll(".gift")];
  const grabButton = $("grab-button");
  const hint = $("hint");
  const dialog = $("reward-dialog");
  let position = 50;
  let busy = false;
  let plays = 0;
  let rewardData = [];
  let currentReward = null;

  const setHint = (message) => { hint.textContent = message; };
  const moveClaw = (direction) => {
    if (busy) return;
    position = Math.max(10, Math.min(90, position + direction * 8));
    clawTrack.style.left = position + "%";
    $("luck-display").textContent = position < 35 ? "LEFT!" : position > 65 ? "RIGHT!" : "CENTER!";
    gifts.forEach((gift, index) => {
      const center = ((index % 5) + 0.5) * 20;
      gift.classList.toggle("targeted", Math.abs(center - position) < 11);
    });
  };

  const weightedPick = (items) => {
    const total = items.reduce((sum, item) => sum + Number(item.weight || 0), 0);
    if (!items.length || total <= 0) throw new Error("Dữ liệu quà trong rewards.json chưa hợp lệ.");
    let roll = Math.random() * total;
    for (const item of items) {
      roll -= Number(item.weight || 0);
      if (roll < 0) return item;
    }
    return items[items.length - 1];
  };

  const showReward = (reward) => {
    currentReward = reward;
    $("reward-rarity").textContent = reward.rarityLabel || "YOU GOT A GIFT!";
    $("reward-emoji").textContent = reward.emoji || "🎁";
    $("reward-title").textContent = reward.name || "Một món quà dành cho bạn!";
    $("reward-message").textContent = reward.message || "Chúc bạn có một ngày 20/10 thật vui!";
    $("reward-name").textContent = (reward.rarity || "common").toUpperCase() + " · 20/10";
    if (typeof dialog.showModal === "function") dialog.showModal();
    else alert((reward.name || "Món quà") + "\n\n" + (reward.message || ""));
  };

  const grab = () => {
    if (busy) return;
    if (!rewardData.length) {
      setHint("Chưa tải được rewards.json. Hãy mở trang bằng Live Server hoặc GitHub Pages.");
      return;
    }
    busy = true;
    grabButton.disabled = true;
    plays += 1;
    $("plays").textContent = String(plays).padStart(2, "0");
    $("luck-display").textContent = "GRABBING";
    setHint("Càng gắp đang hạ xuống... hồi hộp chưa!");
    document.body.classList.add("is-grabbing");
    claw.classList.add("closed");
    cable.style.height = "155px";
    claw.style.top = "146px";

    window.setTimeout(() => {
      const centers = gifts.map((_, index) => ((index % 5) + 0.5) * 20);
      const nearestIndex = centers.reduce((best, center, index) =>
        Math.abs(center - position) < Math.abs(centers[best] - position) ? index : best, 0);
      const aligned = Math.abs(centers[nearestIndex] - position) <= 12;
      const success = aligned && Math.random() < 0.82;
      cable.style.height = "66px";
      claw.style.top = "57px";
      claw.classList.remove("closed");
      if (success) {
        gifts[nearestIndex].classList.add("captured");
        const reward = weightedPick(rewardData);
        $("luck-display").textContent = reward.rarity === "legendary" ? "JACKPOT!" : "NICE!";
        setHint("Gắp trúng rồi! Có một món quà dành cho bạn.");
        window.setTimeout(() => showReward(reward), 380);
      } else {
        $("luck-display").textContent = "TRY AGAIN";
        setHint(aligned ? "Suýt nữa rồi! Thử thêm một lượt nhé." : "Càng gắp chưa trúng quà. Hãy căn vị trí rồi thử lại!");
      }
      window.setTimeout(() => {
        busy = false;
        grabButton.disabled = false;
        document.body.classList.remove("is-grabbing");
      }, 700);
    }, 650);
  };

  $("left-button").addEventListener("click", () => moveClaw(-1));
  $("right-button").addEventListener("click", () => moveClaw(1));
  grabButton.addEventListener("click", grab);
  $("close-reward").addEventListener("click", () => dialog.close());
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
  $("share-reward").addEventListener("click", async () => {
    if (!currentReward) return;
    const text = currentReward.name + "\n" + currentReward.message;
    try {
      await navigator.clipboard.writeText(text);
      $("share-reward").textContent = "Đã sao chép lời chúc!";
    } catch {
      const helper = document.createElement("textarea");
      helper.value = text;
      helper.setAttribute("readonly", "");
      helper.style.position = "fixed";
      helper.style.opacity = "0";
      document.body.appendChild(helper);
      helper.select();
      const copied = document.execCommand("copy");
      helper.remove();
      $("share-reward").textContent = copied ? "Đã sao chép lời chúc!" : "Hãy chọn và sao chép lời chúc trong hộp quà.";
    }
  });
  document.addEventListener("keydown", (event) => {
    if (dialog.open) return;
    if (event.key === "ArrowLeft" || event.key.toLowerCase() === "a") {
      event.preventDefault(); moveClaw(-1);
    } else if (event.key === "ArrowRight" || event.key.toLowerCase() === "d") {
      event.preventDefault(); moveClaw(1);
    } else if (event.key === " " || event.key === "Enter") {
      if (event.target.tagName !== "BUTTON") { event.preventDefault(); grab(); }
    }
  });

  fetch("rewards.json")
    .then((response) => {
      if (!response.ok) throw new Error("Không tìm thấy rewards.json");
      return response.json();
    })
    .then((data) => {
      if (!Array.isArray(data) || !data.length) throw new Error("Danh sách quà đang trống");
      rewardData = data;
      const totalWeight = rewardData.reduce((sum, reward) => sum + Number(reward.weight || 0), 0);
      $("luck-display").textContent = "READY!";
      setHint("Di chuyển càng gắp bằng nút ◀ ▶ hoặc phím mũi tên, rồi nhấn GRAB!");
      if (totalWeight !== 100) console.warn("Tổng weight trong rewards.json hiện là " + totalWeight + "% (không bắt buộc bằng 100).");
    })
    .catch((error) => {
      console.error(error);
      $("luck-display").textContent = "OFFLINE";
      setHint("Không tải được rewards.json. Hãy mở bằng Live Server, không mở file HTML trực tiếp.");
    });
})();