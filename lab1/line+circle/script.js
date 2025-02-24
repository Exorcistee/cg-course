document.addEventListener('DOMContentLoaded', function () {
    const canvas = document.getElementById('canvas');
    const context = canvas.getContext('2d');

    function drawSteepLine(from, to) 
    {
        const deltaX = Math.abs(to.x - from.x);
        const deltaY = Math.abs(to.y - from.y);
      
        if (from.y > to.y) 
        {
            [from, to] = [to, from];
        }
      
        const stepX = Math.sign(to.x - from.x);
        const errorThreshold = deltaY + 1;
        const deltaErr = deltaX + 1;
      
        let error = deltaErr / 2;
      
        for (let p = { ...from }; p.y <= to.y; ++p.y) 
        {
            context.fillRect(p.x, p.y, 1, 1);
      
            error += deltaErr;
      
            if (error >= errorThreshold) 
            {
                p.x += stepX;
                error -= errorThreshold;
            }
        }
    }
      
    function drawSlopeLine(from, to) 
    {
        const deltaX = Math.abs(to.x - from.x);
        const deltaY = Math.abs(to.y - from.y);
      
        if (from.x > to.x) 
        {
            [from, to] = [to, from];
        }
      
        const stepY = Math.sign(to.y - from.y);
        const errorThreshold = deltaX + 1;
        const deltaErr = deltaY + 1;
      
        let error = deltaErr / 2;
      
        for (let p = { ...from }; p.x <= to.x; ++p.x)
        {
            context.fillRect(p.x, p.y, 1, 1);
      
            error += deltaErr;
      
            if (error >= errorThreshold) 
            {
                p.y += stepY;
                error -= errorThreshold;
            }
        }
    }
      
    window.DrawLine = function drawLine(from, to, color) 
    {
        const deltaX = Math.abs(to.x - from.x);
        const deltaY = Math.abs(to.y - from.y);
        context.fillStyle = color;
        if (deltaY > deltaX) 
        {
            drawSteepLine(from, to);
        } 
        else 
        {
            drawSlopeLine(from, to);
        }
    }

    window.DrawCircle = function(x1, y1, radius, color) 
    {
        let x = 0;
        let y = radius;
        let delta = 1 - 2 * radius;
        let error = 0;
        while (y >= x)
        {
            context.fillStyle = color;
            context.fillRect(x1 + x, y1 + y, 1, 1);
            context.fillRect(x1 + x, y1 - y, 1, 1);
            context.fillRect(x1 - x, y1 + y, 1, 1);
            context.fillRect(x1 - x, y1 - y, 1, 1);
            context.fillRect(x1 + y, y1 + x, 1, 1);
            context.fillRect(x1 + y, y1 - x, 1, 1);
            context.fillRect(x1 - y, y1 + x, 1, 1);
            context.fillRect(x1 - y, y1 - x, 1, 1);
            error = 2 * (delta + y) - 1;
            if ((delta < 0) && (error <= 0))
            {
                delta += 2 * ++x + 1;
                continue;
            }
            if ((delta > 0) && (error > 0))
            {
                delta -= 2 * --y + 1;
                continue;
            }
            delta += 2 * (++x - --y);
        }
    }
});