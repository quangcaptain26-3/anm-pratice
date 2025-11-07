<div align="center">

# Ứng dụng Trắc nghiệm An toàn Mạng

Một ứng dụng web được thiết kế để giúp bạn kiểm tra và củng cố kiến thức về an toàn mạng thông qua các câu hỏi trắc nghiệm theo từng chương.

</div>

<p align="center">
  <!-- Badges -->
  <img alt="GitHub Language Count" src="https://img.shields.io/github/languages/count/quangcaptain26-3/anm-pratice?style=for-the-badge&color=blue">
  <img alt="GitHub Top Language" src="https://img.shields.io/github/languages/top/quangcaptain26-3/anm-pratice?style=for-the-badge&color=blueviolet">
  <img alt="GitHub Repo Stars" src="https://img.shields.io/github/stars/quangcaptain26-3/anm-pratice?style=for-the-badge&color=yellow">
  <img alt="GitHub Repo Size" src="https://img.shields.io/github/repo-size/quangcaptain26-3/anm-pratice?style=for-the-badge&color=green">
  <img alt="GitHub Last Commit" src="https://img.shields.io/github/last-commit/quangcaptain26-3/anm-pratice?style=for-the-badge&color=orange">
  <img alt="MIT License" src="https://img.shields.io/badge/License-MIT-green.svg?style=for-the-badge">
</p>

<p align="center">
  <img src="https://raw.githubusercontent.com/quangcaptain26-3/anm-pratice/main/demo.gif" alt="Demo GIF" width="80%">
</p>

## 📚 Mục lục

- [Giới thiệu](#-giới-thiệu)
- [Tính năng chính](#-tính-năng-chính)
- [Công nghệ sử dụng](#-công-nghệ-sử-dụng)
- [Bắt đầu](#-bắt-đầu)
- [🔧 Tùy chỉnh](#-tùy-chỉnh)
  - [Thêm bộ câu hỏi mới](#1-thêm-bộ-câu-hỏi-mới)
  - [Chỉnh sửa giao diện (Theme)](#2-chỉnh-sửa-giao-diện-theme)
- [Đóng góp](#-đóng-góp)
- [Giấy phép](#-giấy-phép)
- [Liên hệ](#-liên-hệ)

## 🎯 Giới thiệu

Dự án này là một công cụ học tập hiệu quả, cho phép người dùng thực hành các câu hỏi trắc nghiệm về an toàn mạng được chia theo từng chủ đề. Giao diện đơn giản, trực quan và tập trung vào trải nghiệm người dùng, giúp việc học và ôn tập trở nên dễ dàng hơn.

## ✨ Tính năng chính

- **Chọn bài kiểm tra**: Lựa chọn làm bài theo từng chương hoặc các bài bonus.
- **Giao diện làm bài thông minh**:
  - Thanh điều hướng câu hỏi cho phép chuyển đến bất kỳ câu nào.
  - Đánh dấu các câu đã trả lời.
- **Xem kết quả**: Nhận điểm số ngay sau khi nộp bài.
- **Xem lại bài làm**: Kiểm tra lại chi tiết các câu trả lời, so sánh với đáp án đúng.
- **Làm lại**: Dễ dàng thực hiện lại bài kiểm tra để cải thiện điểm số.

## 💻 Công nghệ sử dụng

Dự án được xây dựng hoàn toàn bằng các công nghệ web cơ bản, không yêu cầu framework phức tạp.

- ![HTML5](https://img.shields.io/badge/HTML5-E34F26?style=for-the-badge&logo=html5&logoColor=white)
- ![CSS3](https://img.shields.io/badge/CSS3-1572B6?style=for-the-badge&logo=css3&logoColor=white)
- ![JavaScript](https://img.shields.io/badge/JavaScript-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)

## 🚀 Bắt đầu

Để chạy dự án này trên máy của bạn, hãy làm theo các bước đơn giản sau.

### Yêu cầu

- Một trình duyệt web hiện đại (Chrome, Firefox, Safari, Edge).
- Git (để clone repository).

### Cài đặt

1.  **Clone repository về máy của bạn:**
    ```sh
    git clone https://github.com/quangcaptain26-3/anm-pratice.git
    ```
2.  **Điều hướng đến thư mục dự án:**
    ```sh
    cd anm-pratice
    ```
3.  **Mở file `index.html`:**
    -   Cách 1: Mở trực tiếp file `index.html` bằng trình duyệt của bạn.
    -   Cách 2 (Khuyên dùng): Sử dụng một server ảo như **Live Server** trong Visual Studio Code để tránh các lỗi liên quan đến CORS khi fetch dữ liệu.

## 🔧 Tùy chỉnh

Bạn có thể dễ dàng tùy chỉnh và mở rộng ứng dụng này.

### 1. Thêm bộ câu hỏi mới

Để thêm một chương mới hoặc một bộ câu hỏi mới, hãy làm theo các bước sau:

#### Bước 1: Tạo file JSON dữ liệu

1.  Vào thư mục `data/`.
2.  Tạo một file JSON mới, ví dụ `chuong9-10.json`.
3.  Nội dung file phải theo cấu trúc sau:

    ```json
    {
      "ten_chuong_moi": [
        {
          "id": 1,
          "question": "Nội dung câu hỏi ở đây?",
          "options": {
            "A": "Lựa chọn A",
            "B": "Lựa chọn B",
            "C": "Lựa chọn C",
            "D": "Lựa chọn D"
          },
          "answer": "B"
        },
        {
          "id": 2,
          "question": "Một câu hỏi khác?",
          "options": {
            "A": "Đáp án A",
            "B": "Đáp án B",
            "C": "Đáp án C",
            "D": "Đáp án D"
          },
          "answer": "C"
        }
      ]
    }
    ```

    **Lưu ý:**
    - `"ten_chuong_moi"` là một key duy nhất cho bộ câu hỏi của bạn.
    - Mỗi câu hỏi là một object trong mảng.
    - `id` phải là duy nhất trong phạm vi file đó.
    - `answer` phải là key của đáp án đúng trong `options` (A, B, C, hoặc D).

#### Bước 2: Cập nhật `script.js`

1.  Mở file `script.js`.
2.  Tìm đến hằng số `dataFiles` ở đầu file.
3.  Thêm một object mới vào mảng này để ứng dụng nhận diện file câu hỏi mới của bạn:

    ```javascript
    const dataFiles = [
      { name: "Chương 1-2", file: "chuong1-2.json" },
      { name: "Chương 3-4", file: "chuong3-4.json" },
      // ... các file khác
      { name: "Chương 9-10", file: "chuong9-10.json" }, // <== Thêm dòng này
    ];
    ```

    - `name`: Tên sẽ hiển thị trên nút bấm ở trang chủ.
    - `file`: Tên file JSON bạn vừa tạo trong thư mục `data/`.

4.  Lưu file, và ứng dụng sẽ tự động hiển thị lựa chọn mới.

### 2. Chỉnh sửa giao diện (Theme)

Bạn có thể dễ dàng thay đổi màu sắc của ứng dụng bằng cách chỉnh sửa các biến CSS.

1.  Mở file `style.css`.
2.  Tìm đến selector `:root` ở đầu file.
3.  Thay đổi mã màu cho các biến dưới đây để tạo giao diện của riêng bạn:

    ```css
    :root {
        --primary-grad-start: #ff758c; /* Màu gradient bắt đầu */
        --primary-grad-end: #ff7eb3;   /* Màu gradient kết thúc */
        --secondary-color: #e83e8c;    /* Màu phụ (cho nút) */
        --background-color: #fff5f7;  /* Màu nền trang */
        --surface-color: #ffffff;     /* Màu nền của container */
        --text-color: #495057;        /* Màu chữ chính */
        --correct-color: #198754;     /* Màu cho đáp án đúng */
        --incorrect-color: #dc3545;   /* Màu cho đáp án sai */
        --border-color: #f0d9e5;      /* Màu viền */
    }
    ```

## 🤝 Đóng góp

Những đóng góp của bạn làm cho cộng đồng mã nguồn mở trở thành một nơi tuyệt vời để học hỏi, truyền cảm hứng và sáng tạo. Mọi đóng góp bạn thực hiện đều được **đánh giá cao**.

Nếu bạn có đề xuất để cải thiện điều này, vui lòng fork repo và tạo một pull request. Bạn cũng có thể chỉ cần mở một issue với thẻ "enhancement".
Đừng quên gắn dấu sao cho dự án! Cảm ơn một lần nữa!

1.  Fork the Project
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4.  Push to the Branch (`git push origin feature/AmazingFeature`)
5.  Open a Pull Request

## 📜 Giấy phép

Dự án này được cấp phép theo Giấy phép MIT. Xem file `LICENSE.txt` để biết thêm chi tiết.

## 📬 Liên hệ

**Phạm Minh Quang**

-   **Email**: [phamminhquang2603@gmail.com](mailto:phamminhquang2603@gmail.com)
-   **GitHub**: [quangcaptain26-3](https.github.com/quangcaptain26-3)

**Link dự án**: [https://github.com/quangcaptain26-3/anm-pratice](https://github.com/quangcaptain26-3/anm-pratice)
