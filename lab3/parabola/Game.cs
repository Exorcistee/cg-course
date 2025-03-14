using System;
using OpenTK.Windowing.Common;
using OpenTK.Windowing.Desktop;
using OpenTK.Graphics.OpenGL4;
using OpenTK.Mathematics;

namespace GraphPlotter
{
    public class GraphWindow : GameWindow
    {
        double xMinFixed = -6;
        double xMaxFixed = 6;
        double yMinFixed = -10;
        double yMaxFixed = 60;

        double funcXMin = -5;
        double funcXMax = 5;

        public GraphWindow(GameWindowSettings gameWindowSettings, NativeWindowSettings nativeWindowSettings)
            : base(gameWindowSettings, nativeWindowSettings)
        {
        }

        protected override void OnLoad()
        {
            base.OnLoad();
            GL.ClearColor(1.0f, 1.0f, 1.0f, 1.0f);

            GL.Enable(EnableCap.LineSmooth);
            GL.Hint(HintTarget.LineSmoothHint, HintMode.Nicest);
        }

        protected override void OnResize(ResizeEventArgs e)
        {
            base.OnResize(e);
            GL.Viewport(0, 0, Size.X, Size.Y);

            // Сохраняем пропорции логической системы координат
            double fixedWidth = xMaxFixed - xMinFixed;
            double fixedHeight = yMaxFixed - yMinFixed;
            double fixedAspect = fixedWidth / fixedHeight;
            double windowAspect = Size.X / (double)Size.Y;

            double xMin, xMax, yMin, yMax;
            if (windowAspect >= fixedAspect)
            {
                // Если окно шире, чем логическая область, корректируем по горизонтали
                yMin = yMinFixed;
                yMax = yMaxFixed;
                double newWidth = fixedHeight * windowAspect;
                double mid = (xMinFixed + xMaxFixed) / 2.0;
                xMin = mid - newWidth / 2;
                xMax = mid + newWidth / 2;
            }
            else
            {
                // Если окно уже, корректируем по вертикали
                xMin = xMinFixed;
                xMax = xMaxFixed;
                double newHeight = fixedWidth / windowAspect;
                double mid = (yMinFixed + yMaxFixed) / 2.0;
                yMin = mid - newHeight / 2;
                yMax = mid + newHeight / 2;
            }

            GL.MatrixMode(MatrixMode.Projection);
            GL.LoadIdentity();
            GL.Ortho(xMin, xMax, yMin, yMax, -1, 1);
            GL.MatrixMode(MatrixMode.Modelview);
            GL.LoadIdentity();
        }

        protected override void OnRenderFrame(FrameEventArgs args)
        {
            base.OnRenderFrame(args);
            GL.Clear(ClearBufferMask.ColorBufferBit);

            DrawAxes();
            DrawFunction();

            SwapBuffers();
        }

        private void DrawAxes()
        {
            GL.Color3(0.0f, 0.0f, 0.0f); // цвет осей – черный
            GL.LineWidth(2.0f);

            double tickStepX = 1.0;
            double tickStepY = 5.0;
            double tickSizeX = (yMaxFixed - yMinFixed) * 0.01;
            double tickSizeY = (xMaxFixed - xMinFixed) * 0.01;

            // Рисуем ось X, если 0 входит в диапазон по Y
            if (0 >= yMinFixed && 0 <= yMaxFixed)
            {
                GL.Begin(PrimitiveType.Lines);
                GL.Vertex2(xMinFixed, 0);
                GL.Vertex2(xMaxFixed, 0);
                GL.End();

                // Стрелки на концах оси X
                double arrowSize = (xMaxFixed - xMinFixed) * 0.02;
                GL.Begin(PrimitiveType.Lines);
                // Стрелка справа
                GL.Vertex2(xMaxFixed, 0);
                GL.Vertex2(xMaxFixed - arrowSize, arrowSize);
                GL.Vertex2(xMaxFixed, 0);
                GL.Vertex2(xMaxFixed - arrowSize, -arrowSize);
                // Стрелка слева
                GL.Vertex2(xMinFixed, 0);
                GL.Vertex2(xMinFixed + arrowSize, arrowSize);
                GL.Vertex2(xMinFixed, 0);
                GL.Vertex2(xMinFixed + arrowSize, -arrowSize);
                GL.End();

                // Деления на оси X
                for (double x = Math.Ceiling(xMinFixed); x <= xMaxFixed; x += tickStepX)
                {
                    GL.Begin(PrimitiveType.Lines);
                    GL.Vertex2(x, -tickSizeX);
                    GL.Vertex2(x, tickSizeX);
                    GL.End();
                }
            }

            // Рисуем ось Y, если 0 входит в диапазон по X
            if (0 >= xMinFixed && 0 <= xMaxFixed)
            {
                GL.Begin(PrimitiveType.Lines);
                GL.Vertex2(0, yMinFixed);
                GL.Vertex2(0, yMaxFixed);
                GL.End();

                // Стрелки на концах оси Y
                double arrowSize = (yMaxFixed - yMinFixed) * 0.02;
                GL.Begin(PrimitiveType.Lines);
                // Стрелка сверху
                GL.Vertex2(0, yMaxFixed);
                GL.Vertex2(arrowSize, yMaxFixed - arrowSize);
                GL.Vertex2(0, yMaxFixed);
                GL.Vertex2(-arrowSize, yMaxFixed - arrowSize);
                // Стрелка снизу
                GL.Vertex2(0, yMinFixed);
                GL.Vertex2(arrowSize, yMinFixed + arrowSize);
                GL.Vertex2(0, yMinFixed);
                GL.Vertex2(-arrowSize, yMinFixed + arrowSize);
                GL.End();

                // Деления на оси Y
                for (double y = Math.Ceiling(yMinFixed / tickStepY) * tickStepY; y <= yMaxFixed; y += tickStepY)
                {
                    GL.Begin(PrimitiveType.Lines);
                    GL.Vertex2(-tickSizeY, y);
                    GL.Vertex2(tickSizeY, y);
                    GL.End();
                }
            }
        }

        /// <summary>
        /// Рисует график функции y = 2x^2 - 3x - 8.
        /// </summary>
        private void DrawFunction()
        {
            GL.Color3(1.0f, 0.0f, 0.0f); // цвет графика – красный
            GL.LineWidth(2.0f);
            GL.Begin(PrimitiveType.LineStrip);
            double step = 0.01;
            for (double x = funcXMin; x <= funcXMax; x += step)
            {
                double y = 2 * x * x - 3 * x - 8;
                GL.Vertex2(x, y);
            }
            GL.End();
        }
    }

    public static class Program
    {
        public static void Main()
        {
            var gameWindowSettings = GameWindowSettings.Default;
            var nativeWindowSettings = new NativeWindowSettings()
            {
                Size = new Vector2i(800, 600),
                Title = "Построение графика функции на OpenTK"
            };

            using (var window = new GraphWindow(gameWindowSettings, nativeWindowSettings))
            {
                window.Run();
            }
        }
    }
}
