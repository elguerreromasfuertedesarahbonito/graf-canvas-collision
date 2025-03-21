const canvas = document.getElementById("gameCanvas");
let ctx = canvas.getContext("2d");
//Obtiene las dimensiones de la pantalla actual
const window_height = window.innerHeight;
const window_width = window.innerWidth;
canvas.height = window_height;
canvas.width = window_width;
canvas.style.background = "#ff8";

class Circle {
    constructor(x, y, radius, color, text, speed) {
        this.posX = x;
        this.posY = y;
        this.radius = radius;
        this.color = color;
        this.text = text;
        this.speed = speed;
        this.originalColor = color; // Store the original color
        this.dx = Math.random() < 0.5 ? speed : -speed; // Random direction
        this.dy = Math.random() < 0.5 ? speed : -speed; // Random direction
    }

    draw(context) {
        context.beginPath();
        context.fillStyle = this.color; // Set fill color
        context.fill(); // Fill the circle
        context.strokeStyle = this.color; // Set stroke color

        context.textAlign = "center";
        context.textBaseline = "middle";
        context.font = "20px Arial";
        context.fillText(this.text, this.posX, this.posY);
        context.lineWidth = 2;
        context.arc(this.posX, this.posY, this.radius, 0, Math.PI * 2, false);
        context.stroke();
        context.closePath();
    }

    update(context) {
        this.draw(context);
        // Actualizar la posición X
        this.posX += this.dx;
        // Cambiar la dirección si el círculo llega al borde del canvas en X
        if (this.posX + this.radius > window_width || this.posX - this.radius < 0) {
            this.dx = -this.dx;
        }
        // Actualizar la posición Y
        this.posY += this.speed; // Fall downwards at assigned speed

        // Regenerate circle if it falls below the canvas
        if (this.posY - this.radius > window_height) {
            this.posY = -this.radius; // Reset to just above the canvas
            this.posX = Math.random() * (window_width - this.radius * 2) + this.radius; // New random X position
            this.speed = Math.random() * 4 + 1; // New random speed
        }
    }
}

let removedCirclesCount = 0; // Counter for removed circles

// Crear un array para almacenar N círculos
let circles = [];

canvas.addEventListener('click', (event) => {
    const mouseX = event.clientX;
    const mouseY = event.clientY;

    circles = circles.filter(circle => {
        const isInside = Math.sqrt((mouseX - circle.posX) ** 2 + (mouseY - circle.posY) ** 2) < circle.radius;
        if (isInside) {
            removedCirclesCount++;
            document.getElementById('counter').innerText = `Círculos eliminados: ${removedCirclesCount}`;
        }
        return !isInside; // Keep circles that are not clicked
    });
});

// Función para generar círculos aleatorios
function generateCircles(n) {
    for (let i = 0; i < n; i++) {
        let radius = Math.random() * 30 + 20; // Radio entre 20 y 50
        let x = Math.random() * (window_width - radius * 2) + radius;
        let y = -radius; // Start just above the canvas

        let color = `#${Math.floor(Math.random() * 16777215).toString(16)}`; // Color aleatorio
        let speed = Math.random() * 4 + 1; // Velocidad entre 1 y 5
        let text = `C${i + 1}`; // Etiqueta del círculo
        circles.push(new Circle(x, y, radius, color, text, speed));
    }
}

function detectCollision(circle1, circle2) {
    const dx = circle1.posX - circle2.posX;
    const dy = circle1.posY - circle2.posY;
    const distance = Math.sqrt(dx * dx + dy * dy);
    return distance < circle1.radius + circle2.radius;
}

function handleCollisions() {
    for (let i = 0; i < circles.length; i++) {
        for (let j = i + 1; j < circles.length; j++) {
            if (detectCollision(circles[i], circles[j])) {
                circles[i].color = "#0000FF"; // Change to blue on collision
                circles[j].color = "#0000FF"; // Change to blue on collision

                // Calculate the angle of collision
                const angle = Math.atan2(circles[j].posY - circles[i].posY, circles[j].posX - circles[i].posX);
                
                // Calculate the new velocities based on the angle and mass (radius)
                const totalRadius = circles[i].radius + circles[j].radius;
                const overlap = totalRadius - Math.sqrt((circles[i].posX - circles[j].posX) ** 2 + (circles[i].posY - circles[j].posY) ** 2);
                
                // Adjust positions to prevent overlap
                circles[i].posX -= Math.cos(angle) * (overlap / 2);
                circles[i].posY -= Math.sin(angle) * (overlap / 2);
                circles[j].posX += Math.cos(angle) * (overlap / 2);
                circles[j].posY += Math.sin(angle) * (overlap / 2);
                
                // Reverse velocities based on the angle
                circles[i].dx = -Math.cos(angle) * circles[i].speed;
                circles[i].dy = -Math.sin(angle) * circles[i].speed;
                circles[j].dx = Math.cos(angle) * circles[j].speed;
                circles[j].dy = Math.sin(angle) * circles[j].speed;
            } else {
                circles[i].color = circles[i].originalColor; // Revert to original color
                circles[j].color = circles[j].originalColor; // Revert to original color
            }
        }
    }
}

// Función para animar los círculos
function animate() {
    ctx.clearRect(0, 0, window_width, window_height); // Limpiar el canvas
    circles.forEach(circle => {
        circle.update(ctx); // Actualizar cada círculo
    });
    handleCollisions(); // Verificar colisiones
    requestAnimationFrame(animate); // Repetir la animación
}

// Generar N círculos y comenzar la animación
generateCircles(10); // Puedes cambiar el número de círculos aquí
animate();
